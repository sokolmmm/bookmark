import { Module } from '@nestjs/common';

import { AuthNodule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';

@Module({
  imports: [AuthNodule, UserModule, BookmarkModule],
})
export class AppModule {}
