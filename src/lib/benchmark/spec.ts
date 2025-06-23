import * as SwaggerParser from '@apidevtools/swagger-parser'
import axios from 'axios'
import {OpenAPI} from 'openapi-types'

export async function loadSpec(specPathOrUrl: string): Promise<OpenAPI.Document> {
  if (/^https?:\/\//.test(specPathOrUrl)) {
    const resp = await axios.get(specPathOrUrl)
    return resp.data
  }

  return SwaggerParser.parse(specPathOrUrl)
}
