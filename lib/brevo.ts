import * as brevo from "@getbrevo/brevo"

let _contactsApi: brevo.ContactsApi | null = null

export function getBrevoContactsApi(): brevo.ContactsApi {
  if (!_contactsApi) {
    if (!process.env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not set")
    }
    _contactsApi = new brevo.ContactsApi()
    _contactsApi.setApiKey(
      brevo.ContactsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    )
  }
  return _contactsApi
}

export const BREVO_LIST_ID = parseInt(process.env.BREVO_LIST_ID || "3", 10)
