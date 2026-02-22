import { updateAdmissionDetails } from "../controllers/admission.controller.js";
import Admission from "../models/admission/admission.model.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("updateAdmissionDetails security", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("rejects attempts to update email", async () => {
    const req = {
      user: { _id: "user-id" },
      body: { email: "hacker@example.com" },
    };
    const res = mockRes();

    await updateAdmissionDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email cannot be updated" });
  });

  test("does not include status in user update payload", async () => {
    const lean = jest.fn().mockResolvedValue({ _id: "adm-1" });
    const findOneAndUpdateSpy = jest
      .spyOn(Admission, "findOneAndUpdate")
      .mockReturnValue({ lean });

    const req = {
      user: { _id: "user-id" },
      body: {
        status: "accepted",
        city: "Riyadh",
      },
    };
    const res = mockRes();

    await updateAdmissionDetails(req, res);

    expect(findOneAndUpdateSpy).toHaveBeenCalled();
    const payloadArg = findOneAndUpdateSpy.mock.calls[0][1];
    expect(payloadArg.status).toBeUndefined();
    expect(payloadArg.city).toBe("Riyadh");
    expect(lean).toHaveBeenCalled();
  });
});
