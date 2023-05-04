import { AuthenticatedUser } from '../services/authentication.service';
import { AuthToken } from '../models/models';

const userFixture: AuthenticatedUser = new AuthenticatedUser('test', 'test@test.com');

export { userFixture };
