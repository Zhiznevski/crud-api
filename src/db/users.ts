import { generateId } from "../utils/uuid";

export type User = {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
}

export const users: User[] = [
    {
        id: generateId(),
        username: "Artem",
        age: 28,
        hobbies: [],
    },
    {
        id: generateId(),
        username: "Nadya",
        age: 26,
        hobbies: [],
    }
] // TODO: remove it
