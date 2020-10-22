export class Group<V1, V2> {
  private v1: V1;
  private v2: V2;

  constructor(v1: V1, v2: V2) {
    this.v1 = v1;
    this.v2 = v2;
  }

  getV1(): V1 {
    return this.v1;
  }
  getV2(): V2 {
    return this.v2;
  }
}
