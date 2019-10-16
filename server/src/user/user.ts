import { UserDAO } from "./user-repository";

export type UserId = string;

export class User {
  constructor(
    public id: UserId,
    public email: string,
    private userDAO: UserDAO,
  ) {}

  public doSomething() {
    console.log(this.userDAO);
  }
}
