// __mocks__/firebase.ts
export const auth = {
  currentUser: {
    getIdToken: async () => 'test-token',
  },
};
export const signInWithEmailAndPassword = jest.fn();
export const createUserWithEmailAndPassword = jest.fn();
export const signInWithPopup = jest.fn();
export const GoogleAuthProvider = jest.fn();
export const sendSignInLinkToEmail = jest.fn();
export const isSignInWithEmailLink = jest.fn();
export const signInWithEmailLink = jest.fn();
