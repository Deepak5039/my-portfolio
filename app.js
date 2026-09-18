(function () {
  "use strict";

  const lensData = {
    all: {
      evidence: "Public reliability systems, verified analytics work, and a source-backed Azure prototype",
      value: "Connect reliable data foundations with measurable AI behavior",
      filter: "all",
      tab: "analytics",
      linkText: "Selected work",
    },
    analytics: {
      evidence: "Customer segmentation, Power BI reporting, and data-quality experience",
      value: "Turn untidy inputs into clear, decision-ready insight",
      filter: "analytics",
      tab: "analytics",
      linkText: "Analytics work",
    },
    engineering: {
      evidence: "RetailOps Lakehouse Copilot blueprint plus reproducible data-quality workflows",
      value: "Design governed pipelines with explicit quality and observability boundaries",
      filter: "azure",
      tab: "engineering",
      linkText: "Azure architecture",
    },
    genai: {
      evidence: "ToolFault Atlas plus a grounded Azure OpenAI architecture and evaluation set",
      value: "Evaluate grounding, tool failures, schemas, retries, and fallback behavior",
      filter: "genai",
      tab: "genai",
      linkText: "GenAI evidence",
    },
  };

  const architectureData = {
    ingest: {
      label: "Azure Data Factory",
      title: "Orchestrate reliable ingestion",
      copy: "Schedule file, API, and operational extracts with retries, parameterized dates, and auditable run boundaries.",
    },
    bronze: {
      label: "ADLS Gen2 · Bronze",
      title: "Preserve the source record",
      copy: "Land immutable inputs with ingestion metadata, source identifiers, and partitioning before business transformations begin.",
    },
    transform: {
      label: "Databricks · PySpark · Delta",
      title: "Standardize, quarantine, and deduplicate",
      copy: "Apply explicit contracts, isolate invalid rows, keep the latest valid order, and publish governed Silver and Gold tables.",
    },
    serve: {
      label: "Synapse · Power BI",
      title: "Serve metrics with definitions",
      copy: "Expose reconciled revenue, return, cancellation, and freshness metrics through approved analytical views and dashboards.",
    },
    copilot: {
      label: "Azure OpenAI · Retrieval grounding",
      title: "Answer only from approved evidence",
      copy: "Retrieve curated KPI context, attach citations, evaluate groundedness, and refuse questions unsupported by the available data.",
    },
  };

  const projectCards = Array.from(document.querySelectorAll(".project-card"));
  const filterButtons = Array.from(document.querySelectorAll(".filter-button"));
  const lensButtons = Array.from(document.querySelectorAll(".lens-button"));
  const tabButtons = Array.from(document.querySelectorAll(".tab-button"));
  const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
  const stageButtons = Array.from(document.querySelectorAll(".stage-button"));
  const emptyState = document.getElementById("filter-empty");

  function setProjectFilter(filter, shouldFocus) {
    let visibleCount = 0;

    projectCards.forEach((card) => {
      const categories = card.dataset.categories.split(" ");
      const isVisible = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !isVisible);
      card.setAttribute("aria-hidden", String(!isVisible));
      if (isVisible) visibleCount += 1;
    });

    filterButtons.forEach((button) => {
      const selected = button.dataset.filter === filter;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
      if (selected && shouldFocus) button.focus({ preventScroll: true });
    });

    emptyState.hidden = visibleCount !== 0;
  }

  function setActiveTab(name, shouldFocus) {
    tabButtons.forEach((button) => {
      const selected = button.dataset.tab === name;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && shouldFocus) button.focus({ preventScroll: true });
    });

    tabPanels.forEach((panel) => {
      const selected = panel.id === `panel-${name}`;
      panel.hidden = !selected;
      panel.classList.toggle("is-active", selected);
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => setProjectFilter(button.dataset.filter, false));
  });

  lensButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.lens;
      const selectedLens = lensData[name];

      lensButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });

      document.getElementById("lens-evidence").textContent = selectedLens.evidence;
      document.getElementById("lens-value").textContent = selectedLens.value;
      document.getElementById("lens-link").innerHTML = `${selectedLens.linkText} <span aria-hidden="true">↘</span>`;
      setProjectFilter(selectedLens.filter, false);
      setActiveTab(selectedLens.tab, false);
    });
  });

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab, false));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabButtons.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabButtons.length - 1;

      setActiveTab(tabButtons[nextIndex].dataset.tab, true);
    });
  });

  stageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const stage = architectureData[button.dataset.stage];
      if (!stage) return;

      stageButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });

      document.getElementById("architecture-stage-label").textContent = stage.label;
      document.getElementById("architecture-stage-title").textContent = stage.title;
      document.getElementById("architecture-stage-copy").textContent = stage.copy;
    });
  });

  const copyButton = document.getElementById("copy-email");
  const toast = document.getElementById("toast");
  let toastTimer;

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.email);
      toast.textContent = "Email copied";
    } catch (error) {
      toast.textContent = copyButton.dataset.email;
    }

    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll(".reveal");

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const progressBar = document.getElementById("page-progress-bar");
  let ticking = false;

  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    progressBar.style.width = `${progress * 100}%`;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    },
    { passive: true }
  );

  document.getElementById("current-year").textContent = String(new Date().getFullYear());
  updateProgress();
})();
