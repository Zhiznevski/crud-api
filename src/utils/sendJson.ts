import http from 'node:http';

export function sendJson(
  res: http.ServerResponse,
  statusCode: number,
  data?: unknown,
  headers?: http.OutgoingHttpHeaders | http.OutgoingHttpHeader[],
) {
  res.statusCode = statusCode;
  res.writeHead(statusCode, { 'Content-Type': 'application/json', ...headers });
  res.end(JSON.stringify(data));
}
