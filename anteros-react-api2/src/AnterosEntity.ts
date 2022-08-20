export class AnterosEntity {
  private _id: any;

  constructor(id: any) {
    this._id = id;
  }

  /**
   * Getter id
   * @return {any}
   */
  public get id(): any {
    return this._id;
  }

  /**
   * Setter id
   * @param {any} value
   */
  public set id(value: any) {
    this._id = value;
  }
}
