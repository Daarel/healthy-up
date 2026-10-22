import prisma from '../lib/prisma.js';

class UserService {
  static async getUserProfile(userId) {
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        rankTitle: true,
        level: true,
        experiencePoints: true,
        rewardPoints: true,
        streakCount: true,
        profilePicture: true,
        badges: true,
      },
    });

    if (!userProfile) throw new Error('USER_NOT_FOUND');
    return userProfile;
  }

  static async deleteUserProfile(userId) {
    await prisma.user.delete({
      where: { id: userId },
    });
    return true;
  }

  static async getAllUsersWithPagination(page, limit) {
    const skip = (page - 1) * limit;

    const [users, totalData] = await prisma.$transaction([
      prisma.user.findMany({
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          rankTitle: true,
          level: true,
          streakCount: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalData / limit);

    return {
      users,
      pagination: {
        totalData,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  static async updateProfilePicture(userId, photoProfile) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: photoProfile },
      select: { id: true, username: true, profilePicture: true },
    });

    return updatedUser;
  }

  static calculateLevelAndRank(currentExp, currentLevel, currentRankTitle, badges = []) {
    let exp = currentExp;
    let level = currentLevel;
    let rankTitle = currentRankTitle;
    const updatedBadges = [...(badges || [])];

    while (level < 30) {
      const expRequired = level * 1000;
      if (exp >= expRequired) {
        exp -= expRequired;
        level += 1;

        if (level >= 25) rankTitle = 'legenda';
        else if (level >= 20) rankTitle = 'master_vitalitas';
        else if (level >= 15) rankTitle = 'kesatria_bugar';
        else if (level >= 10) rankTitle = 'pejuang_sehat';
        else if (level >= 5) rankTitle = 'penggerak';

        if (level === 10 && !updatedBadges.includes('LEVEL_10')) {
          updatedBadges.push('LEVEL_10');
        }
        if (level === 20 && !updatedBadges.includes('LEVEL_20')) {
          updatedBadges.push('LEVEL_20');
        }
        if (level === 30 && !updatedBadges.includes('LEVEL_30')) {
          updatedBadges.push('LEVEL_30');
        }
      } else {
        break;
      }
    }

    return {
      experiencePoints: exp,
      level,
      rankTitle,
      badges: updatedBadges,
    };
  }

  static async processLevelUp(userId) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        rankTitle: true,
        experiencePoints: true,
        badges: true,
      },
    });

    if (!currentUser) throw new Error('USER_NOT_FOUND');

    if (currentUser.level >= 30) {
      throw new Error('MAX_LEVEL_REACHED');
    }

    const expRequired = currentUser.level * 1000;

    if (currentUser.experiencePoints < expRequired) {
      throw new Error('INSUFFICIENT_EXP');
    }

    const { experiencePoints: remainingExp, level: newLevel, rankTitle: newTitle, badges: updatedBadges } =
      this.calculateLevelAndRank(
        currentUser.experiencePoints,
        currentUser.level,
        currentUser.rankTitle,
        currentUser.badges,
      );

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        level: newLevel,
        rankTitle: newTitle,
        experiencePoints: remainingExp,
        badges: updatedBadges,
      },
      select: {
        id: true,
        username: true,
        level: true,
        rankTitle: true,
        experiencePoints: true,
        badges: true,
      },
    });

    return updatedUser;
  }
}

export default UserService;
