module.exports.handler = async (event) => {
    const number = event.pathParameters.base; // 'parameter' yerine 'base'

    if (isNaN(number)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid number" }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ squared: number * number }),
    };
};
