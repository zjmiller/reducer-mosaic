import { MaybeUserDAO, UserDAO, UserRepository } from "./user-repository";

export type UserId = string;

export class User {
  public id: string;
  public userDAO: UserDAO;

  constructor(userDAO?: MaybeUserDAO) {
    // Zak: Experimenting with persistence abstractions.
    // Not confident here and would prefer for someone else to do this :)
    if (userDAO) {
      // Create user around existing DB object.
      this.userDAO = userDAO;
      this.id = userDAO.id;
    } else {
      // Create user around new DB object.
      UserRepository.create().then(userDAOResult => {
        this.userDAO = userDAOResult;
        this.id = userDAOResult.id;
      });
    }

    UserRepository.addUserToInMemoryCollection(this);
  }
}
