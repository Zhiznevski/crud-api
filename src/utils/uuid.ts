import { v4 as uuidv4 } from 'uuid';
import { version as uuidVersion } from 'uuid';
import { validate as uuidValidate } from 'uuid';

export function generateId() {
    return uuidv4();
}

export function validateId(uuid: string) {
    return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}

