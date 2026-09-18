"""Representative PySpark transformation for the RetailOps architecture prototype.

This module documents the intended Silver and Gold boundaries. It is not proof of
a deployed Databricks job; deployment-specific catalog and storage paths are left
as parameters on purpose.
"""

from pyspark.sql import DataFrame, Window
from pyspark.sql import functions as F


VALID_STATUSES = ("placed", "fulfilled", "returned", "cancelled")


def standardize_orders(raw: DataFrame) -> tuple[DataFrame, DataFrame]:
    """Return valid Silver orders and quarantined rows with explicit reasons."""

    normalized = (
        raw.withColumn("order_id", F.trim(F.col("order_id").cast("string")))
        .withColumn("store_id", F.trim(F.col("store_id").cast("string")))
        .withColumn("channel", F.lower(F.trim(F.col("channel"))))
        .withColumn("status", F.lower(F.trim(F.col("status"))))
        .withColumn("order_ts", F.to_timestamp("order_ts"))
        .withColumn("amount", F.col("amount").cast("decimal(18,2)"))
        .withColumn("ingested_at", F.to_timestamp("ingested_at"))
    )

    reason = (
        F.when(F.col("order_id").isNull() | (F.col("order_id") == ""), "missing_order_id")
        .when(F.col("order_ts").isNull(), "invalid_order_timestamp")
        .when(F.col("amount").isNull() | (F.col("amount") < 0), "invalid_amount")
        .when(~F.col("status").isin(*VALID_STATUSES), "invalid_status")
    )

    classified = normalized.withColumn("quarantine_reason", reason)
    quarantined = classified.filter(F.col("quarantine_reason").isNotNull())
    valid = classified.filter(F.col("quarantine_reason").isNull()).drop("quarantine_reason")

    newest_first = Window.partitionBy("order_id").orderBy(F.col("ingested_at").desc_nulls_last())
    deduplicated = (
        valid.withColumn("row_number", F.row_number().over(newest_first))
        .filter(F.col("row_number") == 1)
        .drop("row_number")
    )
    return deduplicated, quarantined


def build_daily_store_kpis(silver_orders: DataFrame) -> DataFrame:
    """Create a Gold table with governed daily store and channel metrics."""

    return (
        silver_orders.withColumn("order_date", F.to_date("order_ts"))
        .groupBy("order_date", "store_id", "channel")
        .agg(
            F.countDistinct("order_id").alias("orders"),
            F.sum(F.when(F.col("status") == "fulfilled", F.col("amount")).otherwise(F.lit(0))).alias("fulfilled_revenue"),
            F.sum(F.when(F.col("status") == "returned", F.lit(1)).otherwise(F.lit(0))).alias("returned_orders"),
            F.sum(F.when(F.col("status") == "cancelled", F.lit(1)).otherwise(F.lit(0))).alias("cancelled_orders"),
            F.max("ingested_at").alias("data_freshness_at"),
        )
        .withColumn("return_rate", F.col("returned_orders") / F.when(F.col("orders") == 0, F.lit(None)).otherwise(F.col("orders")))
    )

