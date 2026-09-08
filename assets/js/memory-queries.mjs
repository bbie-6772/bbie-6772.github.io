// Explicit topic names, not generated memories or embedding-based semantic search.
export function queryPlan(query) {
  const key = query.normalize('NFKC').toLowerCase().replace(/\s+/g, '');
  if (['cs', 'cs지식', '컴퓨터cs지식', '컴퓨터과학', '컴퓨터지식'].includes(key)) {
    return [query, '운영체제', '프로세스', '메모리', '스레드', '네트워크', '자료구조'];
  }
  if (['스레드', '쓰레드', 'thread'].includes(key)) return [...new Set([query, '스레드', 'thread'])];
  if (['멀티스레드', '멀티쓰레드', 'multithread', 'multithreading'].includes(key)) return [...new Set([query, '멀티스레드', '멀티 스레드', 'multithread'])];
  return [query];
}
