import { User as UserModel } from "../db/models/user";
import { User } from "./index";

export type UserDAO = UserModel;

export type MaybeUserDAO = UserDAO | null;

const users: User[] = [];

export const UserRepository = {
  async create(userFields?: { email?: string }): Promise<UserModel> {
    return UserModel.create(userFields);
  },

  addUserToInMemoryCollection(user: User) {
    users.push(user);
  },

  async findUserByPk(pk: string) {
    if (users.find(u => u.id === pk)) {
      return users.find(u => u.id === pk);
    }

    const userDAO = await UserModel.findByPk(pk);

    if (!userDAO) {
      throw Error("User not found");
    }

    return new User(userDAO.id, userDAO.email, userDAO);
  },

  async findUserByEmail(email: string) {
    if (users.find(u => u.email === email)) {
      return users.find(u => u.email === email);
    }

    const userDAO = await UserModel.findOne({ where: { email } });

    if (!userDAO) {
      throw Error("User not found");
    }

    return new User(userDAO.id, userDAO.email, userDAO);
  },
};
