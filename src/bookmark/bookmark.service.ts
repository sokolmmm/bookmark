import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: number) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });

    return bookmarks;
  }

  async getBookmarkById(userId: number, bookmarkId: number) {}

  async createBookmark(userId: number, dto: CreateBookmarkDto) {}

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {}

  async deleteBookmarkById(userId: number, bookmarkId: number) {}
}
