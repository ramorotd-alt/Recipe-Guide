export function likeLabel(count: number) {
  return count === 1 ? "1 like" : `${count} likes`;
}

export function commentLabel(count: number) {
  return count === 1 ? "1 comment" : `${count} comments`;
}
