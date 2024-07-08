import { Request } from "express";

import jwt from "jsonwebtoken";

export const getUserId = (req: Request) => {
  const token = req.header("authorization")?.split(" ")[1];

  // decode token
  const decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);

  const userid = (decoded as any).id;

  return userid;
};

export default getUserId;
