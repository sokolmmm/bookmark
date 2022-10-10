import { AuthDto } from './../src/auth/dto';
import * as pactum from 'pactum';
import { PrismaService } from './../src/prisma/prisma.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { Test } from '@nestjs/testing';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';
describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3335);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3335/');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'sokol@gmail.com',
      password: '123',
    };
    describe('SignUp', () => {
      it('should throw if email is empty', () => {
        return pactum
          .spec()
          .post('auth/signIn')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if password is empty', () => {
        return pactum
          .spec()
          .post('auth/signIn')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if no body', () => {
        return pactum.spec().post('auth/signIn').expectStatus(400);
      });
      it('should sign up', () => {
        return pactum.spec().post('auth/signUp').withBody(dto);
      });
    });

    describe('SignIn', () => {
      it('should sign in', () => {
        return pactum
          .spec()
          .post('auth/signIn')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('users/me')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('should update user', () => {
        const dto: EditUserDto = {
          email: 'sokol.m@gmail.com',
          firstName: 'sokol',
          lastName: 'sokol',
        };
        return pactum
          .spec()
          .patch('users')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.lastName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('bookmarks')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .expectBody([])
          .expectStatus(200);
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First bookmark',
        link: 'http:some-link',
      };

      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('bookmarks')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('bookmarks')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .expectStatus(200)
          .expectBodyContains(`$S{bookmarkId}`);
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'Bookmark title',
        description: 'description',
        link: 'some link',
      };

      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('bookmarks/{id}')
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('bookmarks')
          .withHeaders({ Authorization: `Bearer $S{userAt}` })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
