export const handler = async (event) => {
    let status = "";
  
    if (event.who === "student") {
      status = "allowed";
    } else {
      status = "denied";
    }
  
    return {
      statusCode: 200,
      body: {entryStatus: status}
    };
  };
  