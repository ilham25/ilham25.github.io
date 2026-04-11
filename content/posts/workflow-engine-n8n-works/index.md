---
date: "2026-04-11T14:55:52+07:00"
draft: true
title: "I Built a Minimal Workflow Engine to Understand How n8n Works Under the Hood"
cover:
  image: "cover.png"
---

## Introduction

I've been using n8n for quite some time now and couldn't help wondering how it works under the hood, so I decided to build a minimal working version of the engine myself.
This post covers how the engine handles execution order, the pluggable node system, expression evaluation, and the diamond merge pattern.

### 1. What is a Workflow Engine?

Basically a workflow engine is just a graph where it have 2 or more nodes that have individual functions like “fetch this URL” or “check this condition”. This connections between nodes is what define the data flow.

At first I was working with a sample data that have a correct topological order (`node 1 -> node 2 -> node 3`), then come the issue when I try to randomize the node order (`node 3 -> node 1 -> node 2`) and this is the tricky part: **the execution order**. You cannot run a node before it’s dependencies have finished and passed their data forward, where in the original case `node 3` depends on `node 2` but at the second case the `node 2` is executed last and this doesn’t meet `node 3` requirements. That is a simple case, but what happens when you have branches, merges? Figuring out the correct order becomes important.

That’s where Directed Acyclic Graph (DAG) concept comes in. Directed because connections always have a direction which is flows in one way and Acyclic because there are no loop because a node cannot eventually depend on itself (ex: `node 1 -> node 2 -> node 3 -> node 1`).

### 2. Execution Order: Kahn's Algorithm Introduction

Once i know what's the graph structure i decided to use, i needed to figure out how can i produce the correct order and this is where Kahn's algorithm comes in. [I learn it from here.](https://www.youtube.com/watch?v=cIBFEhD77b4)

Basically every node has an **in-degree** which is the number of incoming connection it has, well let's call it dependencies. A node with 0 in-degree has no dependencies so it is safe to execute. Once a node is finished, we can add it into the correct topological order or queue and remove the dependency of other nodes to this node and the process is looped until all of the node has no dependency and get executed totally. Here's how i implement it:

```typescript
const queue: NodeType[] = [];
const nodeMap = nodes.reduce((acc, node) => {
  acc.set(node.description.name, node);
  return acc;
}, new Map<string, NodeType>());
const dependencies: Map<string, string[]> = new Map();

// Set a map of dependencies for each node
for (const node of nodes) {
  dependencies.set(
    node.description.name,
    node.description.input.map((i) => i.fromNode),
  );
}

// Kahn's algorithm process loop
while (true) {
  // Stop the loop when the queue is completed
  if (queue.length >= nodes.length) break;

  // Loop over dependencies map
  for (const [key, degrees] of dependencies) {
    // Skip dependency loop process when node still have dependency
    if (degrees.length) {
      continue;
    }

    // Node with no dependencies get added to queue
    queue.push(nodeMap.get(key)!);

    // Removing this node from dependency map
    dependencies.delete(key);
    // Removing dependency of other nodes to current node
    dependencies.forEach((_degrees, _key, map) => {
      map.set(
        _key,
        _degrees.filter((deg) => deg != key),
      );
    });
  }
}

return { queue };
```

The end result is a correct topological order/queue of nodes that safe to execute properly without worry of missing dependency.
