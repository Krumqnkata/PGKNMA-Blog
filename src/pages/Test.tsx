import React from "react";

const test = "<h1>Hello everyone</h1><p>This is a test</p>";

const Test = () => {
  return (
    <div dangerouslySetInnerHTML={{ __html: test }}></div>
  );
};

export default Test;
