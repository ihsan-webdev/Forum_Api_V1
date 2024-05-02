const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthServerTestHelper = require('../../../../tests/AuthServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });
  
  afterAll(async () => {
    await pool.end();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'Mendapatkan benih beras',
        body: 'Silahkan pergi ke toko Sam dari pukul 09:00 sampai 16:00',
      };
      const server = await createServer(container);

      const { accessToken } =
        await AuthServerTestHelper.getAccessTokenUserIdHelper({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

      it('should response 401 when request missing authentication', async () => {
        // Arrange
        const requestPayload = {
          title: 'Mendapatkan benih beras',
          body: 'Silahkan pergi ke toko Sam dari pukul 09:00 sampai 16:00',
        };
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: requestPayload,
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(401);
        expect(responseJson.error).toEqual('Unauthorized');
        expect(responseJson.message).toEqual('Missing authentication');
      });

      it('should response 400 when request payload not contain needed property', async () => {
        // Arrange
        const requestPayload = {
          title: 'Mendapatkan benih beras',
        };
        const server = await createServer(container);

        const { accessToken } = await AuthServerTestHelper.getAccessTokenUserIdHelper({ server });

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
      });

      it('should response 400 when request payload not meet data type specification', async () => {
        // Arrange
        const requestPayload = {
          title: 'Mendapatkan benih beras',
          body: true,
        };
        const server = await createServer(container);

        const { accessToken } = await AuthServerTestHelper.getAccessTokenUserIdHelper({ server });

        // Action
        const response = await server.inject({
          method: 'POST',
          url: '/threads',
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Assert
        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
      });
  });

  // describe('when GET /threads', () => {
  //   it('should response 200 and return threads', async () => {
  //     // Arrange
  //     const server = await createServer(container);
  //     const threadId = 'thread-123';
  //     await UsersTableTestHelper.addUser({});
  //     await ThreadsTableTestHelper.addThread({ id: threadId });

  //     // Action
  //     const response = await server.inject({
  //       method: 'GET',
  //       url: `/threads/${threadId}`,
  //     });

  //     // Assert
  //     const responseJson = JSON.parse(response.payload);
  //     expect(response.statusCode).toEqual(200);
  //     expect(responseJson.status).toEqual('success');
  //     expect(responseJson.data.thread).toBeDefined();
  //   });
  // });
});
