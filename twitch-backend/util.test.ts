import { getClientToken, getUserId, getEventsWithScopes } from "./util"
import fetchMock from "jest-fetch-mock";
import { promises as fsPromises } from 'fs';

fetchMock.enableMocks();

describe('getUserId', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should return the user ID when the fetch is successful', async () => {
    const username = 'testuser';
    const userId = '12345';

    // Mock successful fetch response
    const jsonResponse = { data: [{ id: userId }] };
    fetchMock.mockResponseOnce(JSON.stringify(jsonResponse), { status: 200 });

    const result = await getUserId(username, "token", "clientid");
    expect(result).toEqual(jsonResponse);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.twitch.tv/helix/users?login=${username}`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Bearer .+$/),
          'Client-Id': expect.any(String),
        }),
      })
    );
  });

  it('should return an empty object when the fetch fails', async () => {
    const username = 'testuser';

    // Mock failed fetch response
    fetchMock.mockReject(new Error('Network Error'));

    const result = await getUserId(username, "token", "clientid");
    expect(result).toEqual({});
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});


jest.mock('fs', () => ({
    promises: {
      readFile: jest.fn(),
    },
  }));

const mockedReadFile = fsPromises.readFile as jest.Mock;

describe('getEventsWithScopes', () => {
  test('should return parsed JSON data when the file contains a valid JSON array', async () => {
    // Arrange
    const validJsonData = [{ name: 'Event 1' }, { name: 'Event 2' }];
    mockedReadFile.mockResolvedValue(JSON.stringify(validJsonData));

    // Act
    const result = await getEventsWithScopes('example.json');

    // Assert
    expect(result).toEqual(validJsonData);
  });

  test('should return null when the file is empty', async () => {
    // Arrange
    const emptyFileData = '';
    mockedReadFile.mockResolvedValue(emptyFileData);

    // Act
    const result = await getEventsWithScopes('emptyFile.json');

    // Assert
    expect(result).toBeNull();
  });

  test('should return null when the file contains invalid JSON data', async () => {
    // Arrange
    const invalidJsonData = 'not valid JSON';
    mockedReadFile.mockResolvedValue(invalidJsonData);

    // Act
    const result = await getEventsWithScopes('invalidJsonFile.json');

    // Assert
    expect(result).toBeNull();
  });

  test('should return null when there is an error reading the file', async () => {
    // Arrange
    const errorMessage = 'Error reading the file';
    mockedReadFile.mockRejectedValue(new Error(errorMessage));

    // Act
    const result = await getEventsWithScopes('nonexistentFile.json');

    // Assert
    expect(result).toBeNull();
  });
});
