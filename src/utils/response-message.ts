export const RES_MSG = {
  USER: {
    ALREADY_EXIST: 'Email already exists.',
    CREATE_SUCCESS: 'User created successfully',
    RETRIEVE_SUCCESS: 'Users retrieved successfully.',
    NOT_FOUND: 'User not found.',
    INVALID_CREDENTIALS: 'Invalid credentials.',
    LOGIN_SUCCESS: 'Login successful.',
    LOGOUT_SUCCESS: 'User logged out successfully.',
    PASSWORD_CHANGE_SCUCCESS: 'Password updated successfully.',
    OLD_PASS_INCORRECT: 'Old password incorrect.',
    OLD_NEW_PASS_SAME_ERROR: 'New password can not be same as old password.',
    DELETE_SUCCESS: 'User deleted successfully.',
  },
  ARTIST: {
    CREATE_SUCCESS: 'Artist created successfully.',
    FETCH_SUCCESS: 'Artists fetched successfully.',
    RETRIEVE_SUCCESS: 'Artist retrieved successfully.',
    NOT_FOUND: 'Artist not found.',
    UPDATE_SUCCESS: 'Artist updated successfully.',
    DELETE_SUCCESS: (name: string) => `Artist: ${name} deleted successfully.`,
  },

  ALBUM: {
    CREATE_SUCCESS: 'Album created successfully.',
    FETCH_SUCCESS: 'Albums fetched successfully.',
    RETRIEVE_SUCCESS: 'Album retrieved successfully.',
    NOT_FOUND: 'Resource does not exist.',
    UPDATE_SUCCESS: 'Album updated successfully.',
    ALREADY_EXISTS: 'Album with same name and release year already exists.',
    DELETE_SUCCESS: (name: string) => `Album: ${name} deleted successfully.`,
  },
  TRACK: {
    CREATE_SUCCESS: 'Track created successfully.',
    FETCH_SUCCESS: 'Tracks fetched successfully.',
    RETRIEVE_SUCCESS: 'Track retrieved successfully.',
    NOT_FOUND: 'Resource does not exist.',
    UPDATE_SUCCESS: 'Track updated successfully.',
    ALREADY_EXISTS: 'Track with same name and album already exists.',
    DELETE_SUCCESS: (name: string) => `Track: ${name} deleted successfully.`,
  },
  FAVORITE: {
    CREATE_SUCCESS: 'Favorite added successfully.',
    FETCH_SUCCESS: 'Favorites fetched successfully.',
    NOT_FOUND: 'Resource does not exist.',
    ALREADY_EXISTS: 'Favorite already exists.',
    DELETE_SUCCESS: `Favorite removed successfully.`,
  },
  SMTH_WRNG: 'Something went wrong',
  ACTION_NOT_ALLOWED: 'Action not allowed',
  UNAUTHORIZED: 'Unauthorized Access',
  DATA_FETCH_ERROR: 'Error in fetching data',
  CREATE_ERROR: 'Error in creating data.',
  DATA_SUCCESS: 'Data created successfully.',
  FORIBIDDEN: 'Forbidden Access.',
  BAD_REQUEST: (message: string) => `Bad request: ${message}`,
};
