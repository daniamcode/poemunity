const request = require("supertest");
const { app } = require("../../app");
const Poem = require("../models/Poem");

describe("Poems API - Pagination", () => {
  describe("GET /api/poems with pagination", () => {
    test("should return paginated poems with default limit", async () => {
      // Create 25 test poems
      const poems = Array.from({ length: 25 }, (_, i) => ({
        poem: `Test poem content ${i}`,
        title: `Test Poem ${i}`,
        author: "Test Author",
        genre: "Test",
        date: new Date(),
        userId: "507f1f77bcf86cd799439011",
        origin: "test",
      }));
      await Poem.insertMany(poems);

      const response = await request(app)
        .get("/api/poems")
        .query({ page: 1, limit: 10 })
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(response.body.poems).toHaveLength(10);
      expect(response.body.total).toBe(25);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.totalPages).toBe(3);
      expect(response.body.hasMore).toBe(true);
    });

    test("should return second page of poems", async () => {
      const poems = Array.from({ length: 25 }, (_, i) => ({
        poem: `Test poem content ${i}`,
        title: `Test Poem ${i}`,
        author: "Test Author",
        genre: "Test",
        date: new Date(),
        userId: "507f1f77bcf86cd799439011",
        origin: "test",
      }));
      await Poem.insertMany(poems);

      const response = await request(app)
        .get("/api/poems")
        .query({ page: 2, limit: 10 })
        .expect(200);

      expect(response.body.poems).toHaveLength(10);
      expect(response.body.page).toBe(2);
      expect(response.body.hasMore).toBe(true);
    });

    test("should return last page with remaining poems", async () => {
      const poems = Array.from({ length: 25 }, (_, i) => ({
        poem: `Test poem content ${i}`,
        title: `Test Poem ${i}`,
        author: "Test Author",
        genre: "Test",
        date: new Date(),
        userId: "507f1f77bcf86cd799439011",
        origin: "test",
      }));
      await Poem.insertMany(poems);

      const response = await request(app)
        .get("/api/poems")
        .query({ page: 3, limit: 10 })
        .expect(200);

      expect(response.body.poems).toHaveLength(5);
      expect(response.body.page).toBe(3);
      expect(response.body.hasMore).toBe(false);
    });

    test("should handle page beyond available data", async () => {
      const poems = Array.from({ length: 10 }, (_, i) => ({
        poem: `Test poem content ${i}`,
        title: `Test Poem ${i}`,
        author: "Test Author",
        genre: "Test",
        date: new Date(),
        userId: "507f1f77bcf86cd799439011",
        origin: "test",
      }));
      await Poem.insertMany(poems);

      const response = await request(app)
        .get("/api/poems")
        .query({ page: 5, limit: 10 })
        .expect(200);

      expect(response.body.poems).toHaveLength(0);
      expect(response.body.total).toBe(10);
      expect(response.body.hasMore).toBe(false);
    });

    test("should use default limit when not provided", async () => {
      const poems = Array.from({ length: 30 }, (_, i) => ({
        poem: `Test poem content ${i}`,
        title: `Test Poem ${i}`,
        author: "Test Author",
        genre: "Test",
        date: new Date(),
        userId: "507f1f77bcf86cd799439011",
        origin: "test",
      }));
      await Poem.insertMany(poems);

      const response = await request(app)
        .get("/api/poems")
        .query({ page: 1 })
        .expect(200);

      expect(response.body.poems).toBeDefined();
      expect(response.body.limit).toBeDefined();
    });

    test("should handle pagination with origin filter", async () => {
      const classicPoems = Array.from({ length: 15 }, (_, i) => ({
        poem: `Classic poem ${i}`,
        title: `Classic ${i}`,
        author: "Test Author",
        genre: "Classic",
        date: new Date(),
        userId: "507f1f77bcf86cd799439011",
        origin: "classic",
      }));
      const modernPoems = Array.from({ length: 10 }, (_, i) => ({
        poem: `Modern poem ${i}`,
        title: `Modern ${i}`,
        author: "Test Author",
        genre: "Modern",
        date: new Date(),
        userId: "507f1f77bcf86cd799439011",
        origin: "modern",
      }));
      await Poem.insertMany([...classicPoems, ...modernPoems]);

      const response = await request(app)
        .get("/api/poems")
        .query({ page: 1, limit: 10, origin: "classic" })
        .expect(200);

      expect(response.body.poems).toHaveLength(10);
      expect(response.body.total).toBe(15);
      expect(response.body.hasMore).toBe(true);
      expect(response.body.poems.every((p) => p.origin === "classic")).toBe(
        true
      );
    });

    test("should validate page parameter", async () => {
      const response = await request(app)
        .get("/api/poems")
        .query({ page: 0, limit: 10 })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test("should validate limit parameter", async () => {
      const response = await request(app)
        .get("/api/poems")
        .query({ page: 1, limit: 0 })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    test("should enforce maximum limit", async () => {
      const poems = Array.from({ length: 150 }, (_, i) => ({
        poem: `Test poem content ${i}`,
        title: `Test Poem ${i}`,
        author: "Test Author",
        genre: "Test",
        date: new Date(),
        userId: "507f1f77bcf86cd799439011",
        origin: "test",
      }));
      await Poem.insertMany(poems);

      const response = await request(app)
        .get("/api/poems")
        .query({ page: 1, limit: 200 })
        .expect(200);

      // Should cap at max limit (e.g., 100)
      expect(response.body.limit).toBeLessThanOrEqual(100);
    });

    test("should return poems sorted by date descending", async () => {
      const poems = [
        {
          poem: "Old poem",
          title: "Old",
          author: "Test",
          genre: "Test",
          date: new Date("2020-01-01"),
          userId: "507f1f77bcf86cd799439011",
          origin: "test",
        },
        {
          poem: "New poem",
          title: "New",
          author: "Test",
          genre: "Test",
          date: new Date("2023-01-01"),
          userId: "507f1f77bcf86cd799439011",
          origin: "test",
        },
        {
          poem: "Middle poem",
          title: "Middle",
          author: "Test",
          genre: "Test",
          date: new Date("2021-01-01"),
          userId: "507f1f77bcf86cd799439011",
          origin: "test",
        },
      ];
      await Poem.insertMany(poems);

      const response = await request(app)
        .get("/api/poems")
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.poems).toHaveLength(3);
      expect(response.body.poems[0].title).toBe("New");
      expect(response.body.poems[1].title).toBe("Middle");
      expect(response.body.poems[2].title).toBe("Old");
    });

    test("should filter poems by userId", async () => {
      const user1Id = "507f1f77bcf86cd799439011";
      const user2Id = "507f1f77bcf86cd799439012";

      const user1Poems = Array.from({ length: 8 }, (_, i) => ({
        poem: `User1 poem ${i}`,
        title: `User1 Poem ${i}`,
        author: "User One",
        genre: "Test",
        date: new Date(),
        userId: user1Id,
        origin: "user",
      }));
      const user2Poems = Array.from({ length: 12 }, (_, i) => ({
        poem: `User2 poem ${i}`,
        title: `User2 Poem ${i}`,
        author: "User Two",
        genre: "Test",
        date: new Date(),
        userId: user2Id,
        origin: "user",
      }));
      await Poem.insertMany([...user1Poems, ...user2Poems]);

      const response = await request(app)
        .get("/api/poems")
        .query({ page: 1, limit: 10, userId: user1Id })
        .expect(200);

      expect(response.body.poems).toHaveLength(8);
      expect(response.body.total).toBe(8);
      expect(response.body.poems.every((p) => p.userId === user1Id)).toBe(true);
    });

    test("should filter poems by likedBy userId", async () => {
      const user1Id = "507f1f77bcf86cd799439011";
      const user2Id = "507f1f77bcf86cd799439012";

      const poems = [
        ...Array.from({ length: 5 }, (_, i) => ({
          poem: `Liked by user1 poem ${i}`,
          title: `Liked ${i}`,
          author: "Test Author",
          genre: "Test",
          date: new Date(),
          userId: "507f1f77bcf86cd799439013",
          likes: [user1Id, user2Id],
          origin: "user",
        })),
        ...Array.from({ length: 7 }, (_, i) => ({
          poem: `Not liked by user1 poem ${i}`,
          title: `Not Liked ${i}`,
          author: "Test Author",
          genre: "Test",
          date: new Date(),
          userId: "507f1f77bcf86cd799439013",
          likes: [user2Id],
          origin: "user",
        })),
      ];
      await Poem.insertMany(poems);

      const response = await request(app)
        .get("/api/poems")
        .query({ page: 1, limit: 10, likedBy: user1Id })
        .expect(200);

      expect(response.body.poems).toHaveLength(5);
      expect(response.body.total).toBe(5);
      expect(response.body.poems.every((p) => p.likes.includes(user1Id))).toBe(
        true
      );
    });

    test("should handle pagination with userId filter", async () => {
      const userId = "507f1f77bcf86cd799439011";

      const poems = Array.from({ length: 25 }, (_, i) => ({
        poem: `User poem ${i}`,
        title: `User Poem ${i}`,
        author: "Test User",
        genre: "Test",
        date: new Date(),
        userId,
        origin: "user",
      }));
      await Poem.insertMany(poems);

      const response = await request(app)
        .get("/api/poems")
        .query({ page: 2, limit: 10, userId })
        .expect(200);

      expect(response.body.poems).toHaveLength(10);
      expect(response.body.page).toBe(2);
      expect(response.body.total).toBe(25);
      expect(response.body.hasMore).toBe(true);
    });

    test("should combine multiple filters (userId and origin)", async () => {
      const userId = "507f1f77bcf86cd799439011";

      const poems = [
        ...Array.from({ length: 5 }, (_, i) => ({
          poem: `User classic ${i}`,
          title: `Classic ${i}`,
          author: "Test User",
          genre: "Classic",
          date: new Date(),
          userId,
          origin: "classic",
        })),
        ...Array.from({ length: 3 }, (_, i) => ({
          poem: `User modern ${i}`,
          title: `Modern ${i}`,
          author: "Test User",
          genre: "Modern",
          date: new Date(),
          userId,
          origin: "user",
        })),
      ];
      await Poem.insertMany(poems);

      const response = await request(app)
        .get("/api/poems")
        .query({ page: 1, limit: 10, userId, origin: "classic" })
        .expect(200);

      expect(response.body.poems).toHaveLength(5);
      expect(response.body.total).toBe(5);
      expect(
        response.body.poems.every(
          (p) => p.userId === userId && p.origin === "classic"
        )
      ).toBe(true);
    });

    test("should return all poems as simple array when no pagination params", async () => {
      const poems = Array.from({ length: 15 }, (_, i) => ({
        poem: `Test poem ${i}`,
        title: `Poem ${i}`,
        author: "Test Author",
        genre: "Test",
        date: new Date(),
        userId: "507f1f77bcf86cd799439011",
        origin: "test",
      }));
      await Poem.insertMany(poems);

      const response = await request(app).get("/api/poems").expect(200);

      // Should return simple array without pagination metadata
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(15);
      expect(response.body[0].title).toBeDefined();
      // Should NOT have pagination metadata
      expect(response.body.page).toBeUndefined();
      expect(response.body.total).toBeUndefined();
    });

    test("should return all poems with origin filter when no pagination params", async () => {
      const userPoems = Array.from({ length: 12 }, (_, i) => ({
        poem: `User poem ${i}`,
        title: `User ${i}`,
        author: "Test Author",
        genre: "Test",
        date: new Date(),
        userId: "507f1f77bcf86cd799439011",
        origin: "user",
      }));
      const classicPoems = Array.from({ length: 8 }, (_, i) => ({
        poem: `Classic poem ${i}`,
        title: `Classic ${i}`,
        author: "Test Author",
        genre: "Classic",
        date: new Date(),
        userId: "507f1f77bcf86cd799439011",
        origin: "classic",
      }));
      await Poem.insertMany([...userPoems, ...classicPoems]);

      const response = await request(app)
        .get("/api/poems")
        .query({ origin: "user" })
        .expect(200);

      // Should return all user poems as array
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(12);
      expect(response.body.every((p) => p.origin === "user")).toBe(true);
    });
  });
});
