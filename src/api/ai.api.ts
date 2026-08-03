import { api } from "./axios"

export interface PolicyAnswerResponse {
  answer: string
  keyPoints: string[]
  disclaimer: string
}

export const aiApi = {
  askPolicyQuestion: async (question: string): Promise<PolicyAnswerResponse> => {
    const { data } = await api.post("/ai/policy-qa", { question })
    return data.data ?? data
  },
}
