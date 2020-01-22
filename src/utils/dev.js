const {
    IS_LOCAL,
    IS_OFFLINE
} = process.env;

module.exports.isLocal = () => IS_LOCAL || IS_OFFLINE