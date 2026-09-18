# RetailOps Lakehouse Copilot

RetailOps Lakehouse Copilot is a source-backed **architecture prototype** for a retail data platform on Azure. It is intentionally presented as a prototype, not as a production Azure deployment.

The design unifies point-of-sale orders, e-commerce events, inventory snapshots, and support data into governed Bronze, Silver, and Gold layers. Curated metrics serve Power BI, while a grounded Azure OpenAI layer is designed to answer operational questions with citations to approved Gold tables.

## Business questions

- Which stores and channels are driving revenue, returns, and stock-out risk?
- Which records failed quality checks, and why?
- Can an AI assistant answer KPI questions without inventing unsupported numbers?

## Proposed Azure architecture

1. **Azure Data Factory** orchestrates scheduled ingestion from files, APIs, and operational databases.
2. **ADLS Gen2** stores immutable Bronze inputs and partitioned Silver/Gold outputs.
3. **Azure Databricks + PySpark** standardizes schemas, quarantines invalid records, deduplicates orders, and computes daily KPIs.
4. **Delta Lake** provides ACID tables, audit history, and incremental merge boundaries.
5. **Synapse / Power BI** serves governed analytical views and dashboards.
6. **Azure OpenAI + retrieval grounding** answers questions only from approved KPI records and returns source citations.

## Repository evidence

- `src/transform_orders.py` - PySpark transformation and quarantine boundary.
- `quality_contract.yml` - explicit data-quality rules and ownership.
- `adf/pipeline.json` - representative orchestration definition.
- `evals/questions.json` - grounded-answer evaluation set and refusal cases.
- `architecture.md` - component responsibilities and operational controls.

## Validation boundary

The files demonstrate architecture, transformation logic, contracts, and evaluation design. They have not been deployed to a live Azure subscription, benchmarked at production scale, or presented as client work. A real deployment would add managed identities, Key Vault secrets, private networking, monitoring alerts, infrastructure-as-code, and cost tests.

