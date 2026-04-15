import Realm from 'realm';
import * as Schemas from './Schema';

const realmConfig = {
  schema: Object.values(Schemas),  // import all schemas
  schemaVersion: 1,
};

export const realm = new Realm(realmConfig);
