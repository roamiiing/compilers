import { Stack } from "./stack";

export class Tracer<T> {
  private state = new Stack<T>();
  private waypoints = new Stack<number>();

  waypoint() {
    this.waypoints.push(this.state.length);
  }

  rewind() {
    const waypoint = this.waypoints.pop();
    if (waypoint === null || waypoint === undefined) return [];

    return this.state.popMany(this.state.length - waypoint) ?? [];
  }

  push(...values: T[]) {
    return this.state.push(...values);
  }

  pop() {
    return this.state.pop();
  }

  peek() {
    return this.state.peek();
  }

  findLast(predicate: (value: T) => boolean) {
    return this.state.value.findLast(predicate);
  }

  get current() {
    return this.state.peek();
  }
}
