export const handleDefaultOrError = (userId) => {

    console.log(`User: ${userId} did not have any recognised intent.`);

    return "I could not understand what you wanted me to do, please try again!";
}