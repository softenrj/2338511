# Notifications: Architecture & System Design

## 1. Problem Statement & Objectives

The core challenge is to design and implement a highly efficient **Priority Inbox** engine for a streaming campus notification platform. The system handles a heavy influx of real-time academic updates categorized into three domains: **Placements, Results, and Events**.

As the volume of streams scales, users experience notification fatigue and lose track of critical items. To mitigate this, the engine must maintain a real-time bounded window of the top $n$ (defaulting to 10) most critical unread alerts based on a strict multi-layered ranking heuristic.

---

## 2. Priority Resolution Matrix

Priority evaluation cannot rely on a single parameter. The system models priority by combining **categorical structural weight** and **chronological recency**.

### Rule 1: Categorical Tiering

Notification types are mapped to static numeric weights:

| Notification Type | Weight Level | Significance |
| :--- | :--- | :--- |
| **Placement** | 3 | High (Time-sensitive career impact) |
| **Result** | 2 | Medium (Academic compliance) |
| **Event** | 1 | Low (General campus engagement) |

### Rule 2: Chronological Tie-Breaking

When two notifications fall into the exact same categorical tier (e.g., two competing `Placement` updates), the engine resolves conflicts using chronological recency. The notification with a higher Epoch millisecond timestamp ($T_{\text{epoch}}$) is prioritized.

### Mathematical Formulation

The comparison function evaluates items $a$ and $b$ deterministically. Let $W(x)$ represent categorical weight and $T(x)$ represent the parsed unix epoch timestamp:

$$\text{Score}(x) = W(x) \cdot \alpha + T(x)$$

Where $\alpha$ is a multiplier constant chosen to ensure categorical weight completely dominates chronological age. If $\text{Score}(a) > \text{Score}(b)$, notification $a$ sits higher in priority than $b$.

---

## 3. Streaming Optimization Strategy (Data Structures)

Sorting an un-bounded growing array in a streaming loop requires $O(N \log N)$ time complexity, which degrades performance under high throughput. Since database queries are explicitly prohibited for this tracking stage, the solution utilizes an in-memory **Bounded Min-Heap (Priority Queue)** capped strictly at size $K$ (where $K = n$).

### Algorithmic Flow & Mechanics

1. **Heap Initialization:** An empty Min-Heap data structure is allocated in memory with a default tracking limit of 10 items.
2. **Warm-up Phase:** Until the heap reaches capacity $K$, every incoming notification is directly pushed into the tree using a standard binary `bubbleUp` routine.
3. **Steady-State Processing:** Once the heap is at full capacity ($K = 10$), the root node of our heap represents the absolute **lowest priority item** within our current top 10 pool.
4. **Constant Time Assessment:** When a new notification arrives from the streaming network:
   * It is compared directly with the root node in $O(1)$ constant time.
   * If the incoming item has a *lower* or equal priority score than the root, it is completely ignored and discarded.
   * If the incoming item has a *higher* priority score than the current root, the root is extracted, the new item takes its place, and a binary `sinkDown` operation is triggered to re-balance the tree structures.

### Complexity Breakdown

* **Time Complexity:**
  * **Ingestion/Filtering:** $O(1)$ best case (discarded items), $O(\log K)$ worst-case re-balancing.
  * **View Rendering Extraction:** $O(K \log K)$ to extract elements and display them cleanly in descending layout sequence to the UI layer.
* **Space Complexity:** $O(K)$ auxiliary space bounds. Memory footprints remain strictly flat regardless of whether 100 or 1,000,000 notifications pass through the pipeline.

---

## 4. Production Logging Architecture

To comply with the evaluation constraints, all native system log outputs (`console.log`) have been abstracted away. The engine tightly integrates a modular, decoupled custom `CentralLogger` package.

* **Contextual Tracking:** Every telemetry event is packed with metadata identifying the current operational stack (`frontend`) and target software package space (`utils`, `component`, `api`, `state`).
* **Remote Sync Pipeline:** When a heap state transitions or an API pull resolves, logs are formatted as JSON payloads and dispatched via synchronous `fetch` calls to the target evaluation gateway (`http://4.224.186.213/evaluation-service/log`) using explicit bearer token authorization headers.

---

## 5. Stage 2 Frontend Delivery Specifications

The frontend application implements a client-driven presentation layer mapping to the core architecture principles:

* **State Isolation:** Differentiates new alerts from previously viewed logs purely via memory state matching against client-side persistent tokens (`localStorage`), satisfying the zero-database storage rules.
* **Layout Design:** Built exclusively using Material UI component primitives (`@mui/material`), avoiding prohibited external atomic styling utility layers.
* **Responsive Architecture:** Employs explicit breakpoint columns ensuring data grids collapse cleanly into card blocks when scaling between desktop frameworks and mobile viewport instances.
