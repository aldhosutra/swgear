export interface SwaggerV1Document {
  apis: SwaggerV1Api[]
  apiVersion?: string
  authorizations?: Record<string, unknown>
  basePath: string
  consumes?: string[]
  info?: SwaggerV1Info
  models?: Record<string, SwaggerV1Model>
  produces?: string[]
  resourcePath?: string
  swaggerVersion: string // e.g., "1.2"
}

export interface SwaggerV1Api {
  description?: string
  operations?: SwaggerV1Operation[]
  path: string
}

export interface SwaggerV1Operation {
  authorizations?: Record<string, unknown>
  consumes?: string[]
  deprecated?: string
  method: string // e.g., "GET", "POST"
  nickname?: string
  notes?: string
  parameters?: SwaggerV1Parameter[]
  produces?: string[]
  responseMessages?: SwaggerV1ResponseMessage[]
  summary?: string
  type?: string
}

export interface SwaggerV1Parameter {
  allowMultiple?: boolean
  defaultValue?: unknown
  description?: string
  enum?: string[]
  maximum?: number
  minimum?: number
  name: string
  paramType: string // e.g., "query", "path", "body", "header", "form"
  required: boolean
  type: string
}

export interface SwaggerV1ResponseMessage {
  code: number
  message: string
  responseModel?: string
}

export interface SwaggerV1Model {
  description?: string
  id: string
  properties: Record<string, SwaggerV1ModelProperty>
  required?: string[]
}

export interface SwaggerV1ModelProperty {
  $ref?: string
  description?: string
  enum?: string[]
  items?: {type: string}
  required?: boolean
  type: string
}

export interface SwaggerV1Info {
  contact?: string
  description?: string
  license?: string
  licenseUrl?: string
  termsOfServiceUrl?: string
  title?: string
}
