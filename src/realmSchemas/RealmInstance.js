import Realm from 'realm';
import * as Schemas from './Schema';

const realmConfig = {
  schema: Object.values(Schemas),  // import all schemas
  // v2: added ZaragozaPOI, Valoration, Favourite, Feedback, RecommendationCache
  schemaVersion: 2,
};

export const realm = new Realm(realmConfig);
