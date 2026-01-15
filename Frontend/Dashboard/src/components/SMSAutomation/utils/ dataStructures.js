/**
 * Optimized data structures for SMS automation
 */

// Trie implementation for fast prefix search
export class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.data = null;
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode();
    this.size = 0;
  }

  insert(word, data = null) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char);
    }
    node.isEndOfWord = true;
    node.data = data;
    this.size++;
  }

  search(word) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) {
        return null;
      }
      node = node.children.get(char);
    }
    return node.isEndOfWord ? node.data : null;
  }

  startsWith(prefix) {
    let node = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char);
    }
    return this._collectAllWords(node, prefix);
  }

  _collectAllWords(node, prefix) {
    const results = [];
    if (node.isEndOfWord) {
      results.push({ word: prefix, data: node.data });
    }
    for (const [char, child] of node.children) {
      results.push(...this._collectAllWords(child, prefix + char));
    }
    return results;
  }

  clear() {
    this.root = new TrieNode();
    this.size = 0;
  }
}

// Bloom Filter for membership testing
export class BloomFilter {
  constructor(size = 1000, hashCount = 3) {
    this.size = size;
    this.hashCount = hashCount;
    this.bitArray = new Array(size).fill(false);
  }

  _hash(str, seed) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i) * seed;
      hash |= 0;
    }
    return Math.abs(hash) % this.size;
  }

  add(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this._hash(item, i + 1);
      this.bitArray[index] = true;
    }
  }

  mightContain(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this._hash(item, i + 1);
      if (!this.bitArray[index]) {
        return false;
      }
    }
    return true;
  }
}

// Priority Queue for message queue management
export class PriorityQueue {
  constructor(comparator = (a, b) => a.priority > b.priority) {
    this.heap = [];
    this.comparator = comparator;
    this.indexMap = new Map(); // For O(1) lookups
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.size() === 0;
  }

  peek() {
    return this.heap[0];
  }

  push(value) {
    this.heap.push(value);
    this.indexMap.set(value.id, this.heap.length - 1);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.isEmpty()) return null;
    const root = this.heap[0];
    const last = this.heap.pop();
    this.indexMap.delete(root.id);
    
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.indexMap.set(last.id, 0);
      this._sinkDown(0);
    }
    
    return root;
  }

  updatePriority(id, newPriority) {
    const index = this.indexMap.get(id);
    if (index === undefined) return false;
    
    const oldPriority = this.heap[index].priority;
    this.heap[index].priority = newPriority;
    
    if (this.comparator({ priority: newPriority }, { priority: oldPriority })) {
      this._bubbleUp(index);
    } else {
      this._sinkDown(index);
    }
    
    return true;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (!this.comparator(this.heap[index], this.heap[parent])) break;
      this._swap(index, parent);
      index = parent;
    }
  }

  _sinkDown(index) {
    const lastIndex = this.heap.length - 1;
    while (true) {
      let largest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      
      if (left <= lastIndex && this.comparator(this.heap[left], this.heap[largest])) {
        largest = left;
      }
      
      if (right <= lastIndex && this.comparator(this.heap[right], this.heap[largest])) {
        largest = right;
      }
      
      if (largest === index) break;
      
      this._swap(index, largest);
      index = largest;
    }
  }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    this.indexMap.set(this.heap[i].id, i);
    this.indexMap.set(this.heap[j].id, j);
  }

  clear() {
    this.heap = [];
    this.indexMap.clear();
  }
}

// Circular Buffer for real-time data
export class CircularBuffer {
  constructor(capacity = 100) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  push(item) {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    if (this.size === this.capacity) {
      this.head = (this.head + 1) % this.capacity;
    } else {
      this.size++;
    }
  }

  pop() {
    if (this.size === 0) return null;
    const item = this.buffer[this.head];
    this.head = (this.head + 1) % this.capacity;
    this.size--;
    return item;
  }

  peek() {
    return this.size > 0 ? this.buffer[this.head] : null;
  }

  toArray() {
    const result = [];
    for (let i = 0; i < this.size; i++) {
      const index = (this.head + i) % this.capacity;
      result.push(this.buffer[index]);
    }
    return result;
  }

  clear() {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
    this.buffer = new Array(this.capacity);
  }
}

// Rate Limiter for API calls
export class RateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  canMakeRequest(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean up old entries
    for (const [k, timestamps] of this.requests) {
      const validTimestamps = timestamps.filter(t => t > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(k);
      } else {
        this.requests.set(k, validTimestamps);
      }
    }
    
    const userRequests = this.requests.get(key) || [];
    const recentRequests = userRequests.filter(t => t > windowStart);
    
    if (recentRequests.length >= this.limit) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }

  getWaitTime(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const userRequests = this.requests.get(key) || [];
    const recentRequests = userRequests.filter(t => t > windowStart);
    
    if (recentRequests.length < this.limit) {
      return 0;
    }
    
    const oldestRequest = Math.min(...recentRequests);
    return Math.max(0, oldestRequest + this.windowMs - now);
  }
}

// Message deduplication using content hashing
export class MessageDeduplicator {
  constructor(windowMs = 5 * 60 * 1000) { // 5 minutes
    this.windowMs = windowMs;
    this.messages = new Map();
  }

  generateHash(message, recipient, timestamp) {
    // Simple hash function for deduplication
    const str = `${message}-${recipient}-${Math.floor(timestamp / this.windowMs)}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  isDuplicate(message, recipient) {
    const now = Date.now();
    const hash = this.generateHash(message, recipient, now);
    
    // Clean up old entries
    for (const [key, timestamp] of this.messages) {
      if (now - timestamp > this.windowMs) {
        this.messages.delete(key);
      }
    }
    
    if (this.messages.has(hash)) {
      return true;
    }
    
    this.messages.set(hash, now);
    return false;
  }

  clear() {
    this.messages.clear();
  }
}