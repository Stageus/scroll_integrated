
const parser = (platformTitle) => {
    const list = platformTitle.split('_');
    const result = {
        platformID: list[0],
        title: list[1]
    }

    return result;
}

const maker = (platformID, title) => {
    const result = [platformID, title].join('_');

    return result;
}

module.exports = {
    parser,
    maker
}