{
"openapi": "3.0.1",
"info": {
"title": "Relief Management API",
"version": "v1"
},
"paths": {
"/api/Auth/register": {
"post": {
"tags": [
"Authentication"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.RegisterRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.RegisterRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.RegisterRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.AuthResponse"
}
}
}
},
"400": {
"description": "Bad Request",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/api/Auth/verify-email-otp": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.VerifyEmailOtpRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.VerifyEmailOtpRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.VerifyEmailOtpRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/Auth/resend-email-otp": {
"post": {
"tags": [
"Authentication"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.ResendEmailOtpRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.ResendEmailOtpRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.ResendEmailOtpRequest"
              }
            }
          }
        },
        "responses": {
          "204": {
            "description": "No Content"
          }
        }
      }
    },
    "/api/Auth/login": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.LoginRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.LoginRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.LoginRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.AuthResponse"
}
}
}
},
"401": {
"description": "Unauthorized",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/api/Auth/phone-login": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.LoginPhoneRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.LoginPhoneRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.LoginPhoneRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.AuthResponse"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/Auth/refresh-token": {
"post": {
"tags": [
"Authentication"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.RefreshTokenRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.RefreshTokenRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.RefreshTokenRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.AuthResponse"
}
}
}
},
"401": {
"description": "Unauthorized",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/api/Auth/logout": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.LogoutRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.LogoutRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.LogoutRequest"
              }
            }
          }
        },
        "responses": {
          "204": {
            "description": "No Content"
          }
        }
      }
    },
    "/api/Auth/google-login": {
      "get": {
        "tags": [
          "Authentication"
        ],
        "responses": {
          "302": {
            "description": "Found"
          }
        }
      }
    },
    "/api/Auth/google-callback": {
      "get": {
        "tags": [
          "Authentication"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.AuthResponse"
}
}
}
},
"401": {
"description": "Unauthorized",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/api/Auth/change-password": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "summary": "Change password",
        "description": "Change password for the currently authenticated user.",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.ChangePasswordRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.ChangePasswordRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.ChangePasswordRequest"
}
}
}
},
"responses": {
"204": {
"description": "Password changed successfully"
},
"400": {
"description": "Validation error"
},
"401": {
"description": "Unauthorized"
}
}
}
},
"/api/Auth/forgot-password/send-otp": {
"post": {
"tags": [
"Authentication"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.SendForgotPasswordOtpRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.SendForgotPasswordOtpRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.SendForgotPasswordOtpRequest"
              }
            }
          }
        },
        "responses": {
          "204": {
            "description": "No Content"
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/Auth/forgot-password/verify-otp": {
"post": {
"tags": [
"Authentication"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.VerifyForgotPasswordOtpRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.VerifyForgotPasswordOtpRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.VerifyForgotPasswordOtpRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.AuthResponse"
}
}
}
},
"400": {
"description": "Bad Request",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/api/Auth/forgot-password/reset": {
      "post": {
        "tags": [
          "Authentication"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.ResetPasswordByTokenRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.ResetPasswordByTokenRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Auth.DTOs.ResetPasswordByTokenRequest"
}
}
}
},
"responses": {
"204": {
"description": "No Content"
},
"400": {
"description": "Bad Request",
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/api/campaigns": {
      "post": {
        "tags": [
          "Campaign"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.CreateCampaignRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.CreateCampaignRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.CreateCampaignRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
},
"get": {
"tags": [
"Campaign"
],
"parameters": [
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Keyword",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "Status",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.CampaignStatus"
}
},
{
"name": "Type",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.CampaignType"
}
},
{
"name": "LocationId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "ForVolunteerRegistration",
"in": "query",
"schema": {
"type": "boolean"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/campaigns/{id}": {
"get": {
"tags": [
"Campaign"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"put": {
"tags": [
"Campaign"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.UpdateCampaignRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.UpdateCampaignRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.UpdateCampaignRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/campaigns/{id}/summary": {
      "get": {
        "tags": [
          "Campaign"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/campaigns/{id}/status": {
      "patch": {
        "tags": [
          "Campaign"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.ChangeCampaignStatusRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.ChangeCampaignStatusRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.ChangeCampaignStatusRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/campaigns/{id}/stations": {
      "post": {
        "tags": [
          "Campaign"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.AttachCampaignStationRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.AttachCampaignStationRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.AttachCampaignStationRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/campaigns/{id}/stations/{reliefStationId}": {
"delete": {
"tags": [
"Campaign"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "reliefStationId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/campaigns/{id}/teams": {
"post": {
"tags": [
"Campaign"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.AssignCampaignTeamRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.AssignCampaignTeamRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.AssignCampaignTeamRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "get": {
        "tags": [
          "Campaign"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/campaigns/{id}/teams/{teamId}/status": {
      "patch": {
        "tags": [
          "Campaign"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.UpdateCampaignTeamStatusRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.UpdateCampaignTeamStatusRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.UpdateCampaignTeamStatusRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/campaigns/{id}/teams/{teamId}": {
      "delete": {
        "tags": [
          "Campaign"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/campaigns/{id}/volunteer-registrations": {
      "post": {
        "tags": [
          "Campaign"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "get": {
        "tags": [
          "Campaign"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/campaigns/{id}/volunteer-registrations/me": {
      "delete": {
        "tags": [
          "Campaign"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/DisasterAnalysis/analyze": {
      "post": {
        "tags": [
          "DisasterAnalysis"
        ],
        "summary": "Phân tích nguy cơ thiên tai bằng weather + AI",
        "description": "Lấy thời tiết hiện tại theo lat/lng, tự ước lượng các nguy cơ thiên tai liên quan đến thời tiết, sau đó gọi LLM để sinh phân tích và khuyến nghị tham khảo bằng tiếng Việt. Có thể truyền DisasterType nếu muốn phân tích tập trung vào một loại cụ thể.",
        "operationId": "AnalyzeDisasterRisk",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Request.AnalyzeDisasterRiskRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Request.AnalyzeDisasterRiskRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Request.AnalyzeDisasterRiskRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Response.AnalyzeDisasterRiskResponse"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Response.AnalyzeDisasterRiskResponse"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Response.AnalyzeDisasterRiskResponse"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/donations/checkout": {
"post": {
"tags": [
"Donation"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Donation.DTOs.Request.CreateDonationCheckoutRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Donation.DTOs.Request.CreateDonationCheckoutRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Donation.DTOs.Request.CreateDonationCheckoutRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/donations/{id}/status": {
      "get": {
        "tags": [
          "Donation"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/donations/payment-return": {
      "get": {
        "tags": [
          "Donation"
        ],
        "parameters": [
          {
            "name": "code",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "cancel",
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "orderCode",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/donations/payment-cancel": {
      "get": {
        "tags": [
          "Donation"
        ],
        "parameters": [
          {
            "name": "code",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "id",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "cancel",
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "orderCode",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int64"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/donations/webhook/payos": {
      "post": {
        "tags": [
          "Donation"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Donation.DTOs.Request.PayOsWebhookRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Donation.DTOs.Request.PayOsWebhookRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Donation.DTOs.Request.PayOsWebhookRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/donations/admin": {
      "get": {
        "tags": [
          "Donation"
        ],
        "parameters": [
          {
            "name": "PageIndex",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "Status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DonationStatus"
}
},
{
"name": "CampaignId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "Keyword",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "FromDate",
"in": "query",
"schema": {
"type": "string",
"format": "date-time"
}
},
{
"name": "ToDate",
"in": "query",
"schema": {
"type": "string",
"format": "date-time"
}
},
{
"name": "Period",
"in": "query",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/donations/admin/{id}": {
"get": {
"tags": [
"Donation"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/donations/admin/{id}/reconcile": {
"post": {
"tags": [
"Donation"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/donations/admin/{id}/cancel": {
"post": {
"tags": [
"Donation"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "reason",
"in": "query",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/donations/admin/stats": {
"get": {
"tags": [
"Donation"
],
"parameters": [
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Status",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DonationStatus"
}
},
{
"name": "CampaignId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "Keyword",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "FromDate",
"in": "query",
"schema": {
"type": "string",
"format": "date-time"
}
},
{
"name": "ToDate",
"in": "query",
"schema": {
"type": "string",
"format": "date-time"
}
},
{
"name": "Period",
"in": "query",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/donations/admin/export": {
"get": {
"tags": [
"Donation"
],
"parameters": [
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Status",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DonationStatus"
}
},
{
"name": "CampaignId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "Keyword",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "FromDate",
"in": "query",
"schema": {
"type": "string",
"format": "date-time"
}
},
{
"name": "ToDate",
"in": "query",
"schema": {
"type": "string",
"format": "date-time"
}
},
{
"name": "Period",
"in": "query",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/funds/summary": {
"get": {
"tags": [
"Fund"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/funds/contributions": {
"get": {
"tags": [
"Fund"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/funds/transactions": {
"get": {
"tags": [
"Fund"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Inventory": {
"post": {
"tags": [
"Inventory"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.CreateInventoryRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.CreateInventoryRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.CreateInventoryRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "get": {
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "name": "reliefStationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "level",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.InventoryLevel"
}
},
{
"name": "pageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32",
"default": 1
}
},
{
"name": "pageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32",
"default": 10
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Inventory/{id}": {
"get": {
"tags": [
"Inventory"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"put": {
"tags": [
"Inventory"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.UpdateInventoryRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.UpdateInventoryRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.UpdateInventoryRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "delete": {
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Inventory/{id}/stocks": {
      "get": {
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "pageIndex",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 20
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "post": {
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.AddStockItemRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.AddStockItemRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.AddStockItemRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Inventory/stocks/{stockId}": {
"put": {
"tags": [
"Inventory"
],
"parameters": [
{
"name": "stockId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.UpdateStockItemRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.UpdateStockItemRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.UpdateStockItemRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "delete": {
        "tags": [
          "Inventory"
        ],
        "parameters": [
          {
            "name": "stockId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/InventoryTransaction": {
      "post": {
        "tags": [
          "InventoryTransaction"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.InventoryTransaction.DTOs.Request.CreateTransactionRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.InventoryTransaction.DTOs.Request.CreateTransactionRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.InventoryTransaction.DTOs.Request.CreateTransactionRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/InventoryTransaction/{id}": {
      "get": {
        "tags": [
          "InventoryTransaction"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/InventoryTransaction/by-inventory/{inventoryId}": {
      "get": {
        "tags": [
          "InventoryTransaction"
        ],
        "parameters": [
          {
            "name": "inventoryId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "pageIndex",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 20
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/InventoryTransaction/by-type": {
      "get": {
        "tags": [
          "InventoryTransaction"
        ],
        "parameters": [
          {
            "name": "type",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TransactionType"
}
},
{
"name": "inventoryId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "pageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32",
"default": 1
}
},
{
"name": "pageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32",
"default": 20
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Location/regions": {
"get": {
"tags": [
"Location"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Location/provinces": {
"get": {
"tags": [
"Location"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Location/communes": {
"get": {
"tags": [
"Location"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Location/regions/{regionId}/provinces": {
"get": {
"tags": [
"Location"
],
"parameters": [
{
"name": "regionId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Location/provinces/{provinceId}/communes": {
"get": {
"tags": [
"Location"
],
"parameters": [
{
"name": "provinceId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Location/tree": {
"get": {
"tags": [
"Location"
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Location/search": {
"get": {
"tags": [
"Location"
],
"parameters": [
{
"name": "path",
"in": "query",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/notifications": {
"get": {
"tags": [
"Notification"
],
"summary": "Lấy danh sách notification của user hiện tại",
"operationId": "GetMyNotifications",
"parameters": [
{
"name": "pageNumber",
"in": "query",
"schema": {
"type": "integer",
"format": "int32",
"default": 1
}
},
{
"name": "pageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32",
"default": 20
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/notifications/unread-count": {
"get": {
"tags": [
"Notification"
],
"summary": "Lấy số notification chưa đọc",
"operationId": "GetUnreadNotificationCount",
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/notifications/{notificationId}/read": {
"patch": {
"tags": [
"Notification"
],
"summary": "Đánh dấu 1 notification là đã đọc",
"operationId": "MarkNotificationAsRead",
"parameters": [
{
"name": "notificationId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/notifications/read-all": {
"patch": {
"tags": [
"Notification"
],
"summary": "Đánh dấu tất cả notification là đã đọc",
"operationId": "MarkAllNotificationsAsRead",
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/priority-criteria": {
"get": {
"tags": [
"PriorityCriteria"
],
"summary": "Get all priority criteria (pagination + search by Name, Code, Description)",
"parameters": [
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
}
}
}
}
},
"post": {
"tags": [
"PriorityCriteria"
],
"summary": "Create a new priority criteria",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Request.CreatePriorityCriteriaRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Request.CreatePriorityCriteriaRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Request.CreatePriorityCriteriaRequest"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse"
}
}
}
},
"400": {
"description": "Bad Request",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          },
          "409": {
            "description": "Conflict",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/priority-criteria/{id}": {
"get": {
"tags": [
"PriorityCriteria"
],
"summary": "Get a priority criteria by ID",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
},
"put": {
"tags": [
"PriorityCriteria"
],
"summary": "Update an existing priority criteria",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Request.UpdatePriorityCriteriaRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Request.UpdatePriorityCriteriaRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Request.UpdatePriorityCriteriaRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse"
}
}
}
},
"404": {
"description": "Not Found",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
},
"409": {
"description": "Conflict",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          }
        }
      },
      "delete": {
        "tags": [
          "PriorityCriteria"
        ],
        "summary": "Delete (inactivate) a priority criteria",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "No Content"
          },
          "404": {
            "description": "Not Found",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/procurements": {
"post": {
"tags": [
"Procurement"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.CreateProcurementOrderRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.CreateProcurementOrderRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.CreateProcurementOrderRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/procurements/{id}": {
      "get": {
        "tags": [
          "Procurement"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/procurements/by-campaign/{campaignId}": {
      "get": {
        "tags": [
          "Procurement"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/procurements/{id}/approve": {
      "patch": {
        "tags": [
          "Procurement"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.ApproveProcurementOrderRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.ApproveProcurementOrderRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.ApproveProcurementOrderRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/procurements/{id}/receive": {
      "patch": {
        "tags": [
          "Procurement"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.ReceiveProcurementOrderRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.ReceiveProcurementOrderRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.ReceiveProcurementOrderRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/procurements/{id}/cancel": {
"patch": {
"tags": [
"Procurement"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/realtime/token": {
"get": {
"tags": [
"Realtime"
],
"summary": "Lấy Centrifugo realtime connection token cho user hiện tại",
"operationId": "GetRealtimeToken",
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/relief/campaigns/{campaignId}/households/import": {
"post": {
"tags": [
"ReliefDistribution"
],
"parameters": [
{
"name": "campaignId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ImportCampaignHouseholdsRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ImportCampaignHouseholdsRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ImportCampaignHouseholdsRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/households/{campaignHouseholdId}/assign": {
      "patch": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "campaignHouseholdId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.AssignHouseholdRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.AssignHouseholdRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.AssignHouseholdRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/households": {
      "get": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "Status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.HouseholdFulfillmentStatus"
}
},
{
"name": "DeliveryMode",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DeliveryMode"
            }
          },
          {
            "name": "DistributionPointId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "CampaignTeamId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "IsIsolated",
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "PageIndex",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "Search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.CampaignHouseholdResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.CampaignHouseholdResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.CampaignHouseholdResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              }
            }
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/households/{campaignHouseholdId}": {
      "patch": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "campaignHouseholdId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.UpdateCampaignHouseholdRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.UpdateCampaignHouseholdRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.UpdateCampaignHouseholdRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
},
"delete": {
"tags": [
"ReliefDistribution"
],
"parameters": [
{
"name": "campaignId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "campaignHouseholdId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/relief/campaigns/{campaignId}/checklist": {
"get": {
"tags": [
"ReliefDistribution"
],
"parameters": [
{
"name": "campaignId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "Status",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.HouseholdFulfillmentStatus"
}
},
{
"name": "CampaignTeamId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "DistributionPointId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "DeliveryMode",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DeliveryMode"
}
},
{
"name": "ScheduledFrom",
"in": "query",
"schema": {
"type": "string",
"format": "date-time"
}
},
{
"name": "ScheduledTo",
"in": "query",
"schema": {
"type": "string",
"format": "date-time"
}
},
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdChecklistItemResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdChecklistItemResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdChecklistItemResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
}
}
}
}
}
},
"/api/relief/campaigns/{campaignId}/distribution-points": {
"post": {
"tags": [
"ReliefDistribution"
],
"parameters": [
{
"name": "campaignId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CreateDistributionPointRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CreateDistributionPointRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CreateDistributionPointRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "get": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "ReliefStationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "CampaignTeamId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "IsActive",
            "in": "query",
            "schema": {
              "type": "boolean"
            }
          },
          {
            "name": "PageIndex",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "Search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.DistributionPointResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.DistributionPointResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.DistributionPointResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              }
            }
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/distribution-points/{distributionPointId}": {
      "patch": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "distributionPointId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.UpdateDistributionPointRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.UpdateDistributionPointRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.UpdateDistributionPointRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "delete": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "distributionPointId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/packages": {
      "post": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CreateReliefPackageDefinitionRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CreateReliefPackageDefinitionRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CreateReliefPackageDefinitionRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
},
"get": {
"tags": [
"ReliefDistribution"
],
"parameters": [
{
"name": "campaignId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "IsActive",
"in": "query",
"schema": {
"type": "boolean"
}
},
{
"name": "IsDefault",
"in": "query",
"schema": {
"type": "boolean"
}
},
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.ReliefPackageDefinitionResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.ReliefPackageDefinitionResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.ReliefPackageDefinitionResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
}
}
}
}
}
},
"/api/relief/campaigns/{campaignId}/packages/{reliefPackageDefinitionId}": {
"patch": {
"tags": [
"ReliefDistribution"
],
"parameters": [
{
"name": "campaignId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "reliefPackageDefinitionId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.UpdateReliefPackageDefinitionRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.UpdateReliefPackageDefinitionRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.UpdateReliefPackageDefinitionRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "delete": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "reliefPackageDefinitionId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/packages/{reliefPackageDefinitionId}/assembly-availability": {
      "get": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "reliefPackageDefinitionId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "reliefStationId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "inventoryId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/packages/{reliefPackageDefinitionId}/assemble": {
      "post": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "reliefPackageDefinitionId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.AssembleReliefPackageRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.AssembleReliefPackageRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.AssembleReliefPackageRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/package-assemblies": {
      "get": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/stations/{reliefStationId}/package-assemblies": {
      "get": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "reliefStationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/packages/{reliefPackageDefinitionId}/package-assemblies": {
      "get": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "reliefPackageDefinitionId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/deliveries/{householdDeliveryId}/complete": {
      "post": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "householdDeliveryId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CompleteHouseholdDeliveryRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CompleteHouseholdDeliveryRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CompleteHouseholdDeliveryRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/relief/campaigns/{campaignId}/deliveries/complete-batch": {
"post": {
"tags": [
"ReliefDistribution"
],
"parameters": [
{
"name": "campaignId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CompleteHouseholdDeliveryBatchRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CompleteHouseholdDeliveryBatchRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CompleteHouseholdDeliveryBatchRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/deliveries": {
      "get": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "Status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.HouseholdFulfillmentStatus"
}
},
{
"name": "CampaignTeamId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "DistributionPointId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "DeliveryMode",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DeliveryMode"
            }
          },
          {
            "name": "ScheduledFrom",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "ScheduledTo",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "date-time"
            }
          },
          {
            "name": "PageIndex",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "Search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdDeliveryResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdDeliveryResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdDeliveryResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              }
            }
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/deliveries/{householdDeliveryId}": {
      "get": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "householdDeliveryId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/shortage-requests": {
      "post": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CreateSupplyShortageRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CreateSupplyShortageRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CreateSupplyShortageRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "get": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.SupplyShortageRequestStatus"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/relief/campaigns/{campaignId}/shortage-requests/{shortageRequestId}/approve": {
"patch": {
"tags": [
"ReliefDistribution"
],
"parameters": [
{
"name": "campaignId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "shortageRequestId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ReviewSupplyShortageRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ReviewSupplyShortageRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ReviewSupplyShortageRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief/campaigns/{campaignId}/shortage-requests/{shortageRequestId}/reject": {
      "patch": {
        "tags": [
          "ReliefDistribution"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "shortageRequestId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ReviewSupplyShortageRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ReviewSupplyShortageRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ReviewSupplyShortageRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/health": {
      "get": {
        "tags": [
          "ReliefManagementSystem.API"
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief-stations/provincial": {
      "post": {
        "tags": [
          "ReliefStation"
        ],
        "description": "Manager tạo trạm mới cho tỉnh",
        "operationId": "CreateReliefStation",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.Dtos.CreateProvincialReliefStationRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.Dtos.CreateProvincialReliefStationRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.Dtos.CreateProvincialReliefStationRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
},
"get": {
"tags": [
"ReliefStation"
],
"description": "Lấy danh sách trạm cấp Tỉnh có phân trang và tìm kiếm theo Name, Address, ContactNumber",
"operationId": "GetProvincialStations",
"parameters": [
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Level",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.ReliefStationLevel"
}
},
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/relief-stations/provincial/{stationId}": {
"put": {
"tags": [
"ReliefStation"
],
"description": "Manager cập nhật thông tin trạm cấp Tỉnh",
"operationId": "UpdateProvincialStation",
"parameters": [
{
"name": "stationId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.UpdateProvincialStationRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.UpdateProvincialStationRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.UpdateProvincialStationRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief-stations/my-station": {
      "get": {
        "tags": [
          "ReliefStation"
        ],
        "description": "Lấy thông tin trạm hiện tại Moderator đang quản lý",
        "operationId": "GetCurrentModeratorStation",
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief-stations/provincial/{stationId}/disable": {
      "put": {
        "tags": [
          "ReliefStation"
        ],
        "description": "Manager huỷ (vô hiệu hoá) trạm cấp Tỉnh và các kho liên quan",
        "operationId": "DisableProvincialStation",
        "parameters": [
          {
            "name": "stationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief-stations/provincial/{stationId}/activate": {
      "put": {
        "tags": [
          "ReliefStation"
        ],
        "description": "Manager kích hoạt lại trạm cấp Tỉnh và các kho liên quan",
        "operationId": "ActivateProvincialStation",
        "parameters": [
          {
            "name": "stationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief-stations/{stationId}/assign-moderator": {
      "put": {
        "tags": [
          "ReliefStation"
        ],
        "description": "Manager gán 1 Moderator duy nhất (làm trưởng trạm) cho một trạm cứu trợ",
        "operationId": "AssignModerator",
        "parameters": [
          {
            "name": "stationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.AssignModeratorRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.AssignModeratorRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.AssignModeratorRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/relief-stations/{stationId}/teams": {
      "post": {
        "tags": [
          "ReliefStation"
        ],
        "description": "Moderator trưởng trạm duyệt/gán team vào trạm",
        "operationId": "AssignTeamToStation",
        "parameters": [
          {
            "name": "stationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.AssignTeamRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.AssignTeamRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.AssignTeamRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/relief-stations/{stationId}/teams/{teamId}/status": {
"patch": {
"tags": [
"ReliefStation"
],
"description": "Moderator trưởng trạm cập nhật trạng thái team tại trạm (Active/Transferred/Suspended/Completed/Cancelled)",
"operationId": "UpdateTeamAssignmentStatus",
"parameters": [
{
"name": "stationId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "teamId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.UpdateTeamAssignmentRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.UpdateTeamAssignmentRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.UpdateTeamAssignmentRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/RescueRequest": {
      "post": {
        "tags": [
          "RescueRequest"
        ],
        "summary": "Tạo yêu cầu cứu hộ mới",
        "description": "Người dùng/khách gửi yêu cầu cứu hộ. Hệ thống tự động gắn campaign Rescue đang hiệu lực, chọn trạm gần nhất theo Goong + bán kính CoverageRadiusKm, tạo operation dispatch và tạo RequestVerification. Với Emergency sẽ auto-check thời tiết để quyết định trạng thái xác minh ban đầu.",
        "operationId": "CreateRescueRequest",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CreateRescueRequestDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CreateRescueRequestDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CreateRescueRequestDto"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Created"
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
},
"401": {
"description": "Unauthorized",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          }
        }
      },
      "get": {
        "tags": [
          "RescueRequest"
        ],
        "summary": "Lấy danh sách rescue request có phân trang + tìm kiếm",
        "description": "Search theo: ReporterFullName, ReporterPhone, Address, Description. Có thể lọc thêm theo statusFilter (int) và phân trang bằng pageNumber/pageSize.",
        "operationId": "SearchRescueRequests",
        "parameters": [
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "statusFilter",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "verificationStatus",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "pageNumber",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/RescueRequest/my-station": {
      "get": {
        "tags": [
          "RescueRequest"
        ],
        "summary": "Lấy rescue requests của trạm moderator hiện tại",
        "description": "Backend tự suy ra ReliefStationId từ ModeratorProfile của user đang đăng nhập, chỉ trả về các rescue request thuộc trạm đó.",
        "operationId": "GetCurrentModeratorStationRescueRequests",
        "parameters": [
          {
            "name": "search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "statusFilter",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "verificationStatus",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "pageNumber",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
},
"401": {
"description": "Unauthorized",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/api/RescueRequest/probe-distance-matrix": {
      "get": {
        "tags": [
          "RescueRequest"
        ],
        "summary": "Test Goong Distance Matrix",
        "description": "API probe để kiểm tra khoảng cách/ETA từ origin tới danh sách destination bằng Goong API key hiện tại.",
        "operationId": "ProbeGoongDistanceMatrix",
        "parameters": [
          {
            "name": "originLat",
            "in": "query",
            "schema": {
              "type": "number",
              "format": "double"
            }
          },
          {
            "name": "originLng",
            "in": "query",
            "schema": {
              "type": "number",
              "format": "double"
            }
          },
          {
            "name": "destinationLats",
            "in": "query",
            "schema": {
              "type": "array",
              "items": {
                "type": "number",
                "format": "double"
              }
            }
          },
          {
            "name": "destinationLngs",
            "in": "query",
            "schema": {
              "type": "array",
              "items": {
                "type": "number",
                "format": "double"
              }
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/RescueRequest/probe-weather": {
      "get": {
        "tags": [
          "RescueRequest"
        ],
        "summary": "Test thời tiết hiện tại theo tọa độ",
        "description": "Gọi Weather API theo lat/lng và trả snapshot thời tiết + weather risk score/level để phục vụ xác minh Emergency.",
        "operationId": "ProbeWeatherByLatLng",
        "parameters": [
          {
            "name": "lat",
            "in": "query",
            "schema": {
              "type": "number",
              "format": "double"
            }
          },
          {
            "name": "lng",
            "in": "query",
            "schema": {
              "type": "number",
              "format": "double"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/RescueRequest/{id}": {
      "get": {
        "tags": [
          "RescueRequest"
        ],
        "summary": "Lấy chi tiết rescue request",
        "description": "Trả toàn bộ thông tin request: attachments, verifications, operations, weather snapshot và campaign liên quan.",
        "operationId": "GetRescueRequestById",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          },
          "404": {
            "description": "Not Found",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/RescueRequest/{id}/verify": {
"post": {
"tags": [
"RescueRequest"
],
"summary": "Xác minh rescue request",
"description": "Moderator/Manager/Admin duyệt hoặc từ chối request bằng RequestVerification (status/method/reason/note). Dùng cho bước kiểm tra nghiệp vụ trước khi xử lý tiếp.",
"operationId": "VerifyRescueRequest",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.VerifyRescueRequestDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.VerifyRescueRequestDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.VerifyRescueRequestDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/RescueRequest/{id}/assign-team": {
"post": {
"tags": [
"RescueRequest"
],
"summary": "Gán 1 team cho 1 rescue request",
"description": "Gán team thuộc trạm đã dispatch cho request. Đồng thời cập nhật operation status và đưa request vào queue batch active của team.",
"operationId": "AssignTeamToRescue",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.AssignRescueTeamRequestDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.AssignRescueTeamRequestDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.AssignRescueTeamRequestDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/RescueRequest/assign-team-bulk": {
"post": {
"tags": [
"RescueRequest"
],
"summary": "Gán 1 team cho nhiều rescue request trong một lần gọi",
"description": "Bulk assign theo danh sách requestIds. Kết quả trả về chi tiết từng request thành công/thất bại. Các request hợp lệ sẽ được xếp queue theo RescueBatch/RescueBatchItem.",
"operationId": "AssignTeamToRescueBulk",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.AssignRescueTeamBulkRequestDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.AssignRescueTeamBulkRequestDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.AssignRescueTeamBulkRequestDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.BulkAssignRescueTeamResponseDto"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.BulkAssignRescueTeamResponseDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.BulkAssignRescueTeamResponseDto"
}
}
}
},
"400": {
"description": "Bad Request",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/api/RescueRequest/{id}/dispatch-preview": {
      "post": {
        "tags": [
          "RescueRequest"
        ],
        "summary": "Xem trước phương án điều phối thông minh cho request",
        "description": "Dựa trên active batch, vị trí tracking hiện tại của team, priority và loại request để đề xuất queue mới trước khi moderator xác nhận assign.",
        "operationId": "PreviewSmartAssignRescue",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.DispatchPreviewRequestDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.DispatchPreviewRequestDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.DispatchPreviewRequestDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.DispatchPreviewResponseDto"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.DispatchPreviewResponseDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.DispatchPreviewResponseDto"
}
}
}
}
}
}
},
"/api/RescueRequest/{id}/smart-assign": {
"post": {
"tags": [
"RescueRequest"
],
"summary": "Điều phối request vào team theo queue thông minh",
"description": "Assign team cho request và tự động sắp xếp lại active batch theo loại request, priority và độ gần route hiện tại. Emergency có thể chen ngang nếu đủ điều kiện.",
"operationId": "SmartAssignRescue",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.SmartAssignRescueTeamRequestDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.SmartAssignRescueTeamRequestDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.SmartAssignRescueTeamRequestDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchQueueResponseDto"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchQueueResponseDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchQueueResponseDto"
}
}
}
}
}
}
},
"/api/RescueRequest/dispatch-candidates": {
"get": {
"tags": [
"RescueRequest"
],
"summary": "Lấy danh sách request có thể điều phối",
"description": "Trả danh sách request còn dispatch được theo team. Kèm cờ canDispatch, isInOtherActiveBatch, alreadyAssignedTeamId và lý do block để FE hiển thị đúng UX.",
"operationId": "GetDispatchCandidates",
"parameters": [
{
"name": "TeamId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "PageNumber",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.PaginatedDispatchCandidatesResponseDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.PaginatedDispatchCandidatesResponseDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.PaginatedDispatchCandidatesResponseDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/RescueRequest/{id}/operations/{operationId}/complete": {
      "post": {
        "tags": [
          "RescueRequest"
        ],
        "summary": "Team leader xác nhận hoàn tất cứu hộ (bắt buộc ảnh hiện trường)",
        "description": "Leader của team được assign operation gửi bằng chứng ảnh + ghi chú để xác nhận đã cứu xong tại hiện trường. Sau đó operation chuyển RescueCompleted, queue item chuyển Done và tự đẩy item kế tiếp nếu có.",
        "operationId": "CompleteRescueOperation",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "operationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CompleteRescueOperationRequestDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CompleteRescueOperationRequestDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CompleteRescueOperationRequestDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          },
          "400": {
            "description": "Bad Request",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/RescueRequest/teams/{teamId}/active-batch": {
"get": {
"tags": [
"RescueRequest"
],
"summary": "Lấy queue nhiệm vụ active của team",
"description": "Trả RescueBatch active hiện tại của team, gồm danh sách RescueBatchItem theo SequenceOrder để frontend hiển thị hàng đợi xử lý.",
"operationId": "GetActiveRescueBatchByTeam",
"parameters": [
{
"name": "teamId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchQueueResponseDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchQueueResponseDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchQueueResponseDto"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/RescueRequest/teams/{teamId}/active-batch/reorder": {
"patch": {
"tags": [
"RescueRequest"
],
"summary": "Đổi thứ tự queue nhiệm vụ của team",
"description": "Sắp xếp lại thứ tự request trong batch active theo RequestIdsInOrder. Item đầu queue sẽ được set InProgress; các item còn lại Pending (trừ item Done/Cancelled).",
"operationId": "ReorderActiveRescueBatch",
"parameters": [
{
"name": "teamId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.ReorderRescueBatchRequestDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.ReorderRescueBatchRequestDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.ReorderRescueBatchRequestDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchQueueResponseDto"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchQueueResponseDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchQueueResponseDto"
}
}
}
},
"400": {
"description": "Bad Request",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/api/RescueRequest/teams/{teamId}/active-batch/recalculate-eta": {
      "post": {
        "tags": [
          "RescueRequest"
        ],
        "summary": "Tính lại ETA queue theo vị trí team mới nhất",
        "description": "Lấy TeamTrackingPoint mới nhất của team, gọi Goong matrix tới các request Pending/InProgress trong batch active và cập nhật DistanceKm/EstimatedMinutes cho từng item.",
        "operationId": "RecalculateActiveBatchEta",
        "parameters": [
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "204": {
            "description": "No Content"
          }
        }
      }
    },
    "/api/RescueRequest/{id}/operations/{operationId}/status": {
      "patch": {
        "tags": [
          "RescueRequest"
        ],
        "summary": "Cập nhật trạng thái operation theo tiến độ cứu hộ",
        "description": "Cho phép cập nhật các trạng thái tác nghiệp: EnRoute, Rescuing, Returning, Closed, Cancelled. Dùng để frontend update timeline hành trình cứu hộ theo thời gian thực.",
        "operationId": "UpdateRescueOperationStatus",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "operationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.UpdateRescueOperationStatusRequestDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.UpdateRescueOperationStatusRequestDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.UpdateRescueOperationStatusRequestDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestResponseDto"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestResponseDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestResponseDto"
}
}
}
},
"400": {
"description": "Bad Request",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          }
        }
      }
    },
    "/api/RescueRequest/my-requests": {
      "get": {
        "tags": [
          "RescueRequest"
        ],
        "summary": "Lay lich su yeu cau cuu ho cua toi",
        "description": "Nguoi dung da dang nhap xem danh sach cac yeu cau cuu ho ho da gui (phan trang). Co the loc theo statusFilter (int ma enum RescueRequestStatus). Dung cho man hinh 'Lich su yeu cau' tren mobile app.",
        "operationId": "GetMyRescueRequests",
        "parameters": [
          {
            "name": "PageNumber",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "StatusFilter",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.PaginatedRescueRequestResponseDto"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.PaginatedRescueRequestResponseDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.PaginatedRescueRequestResponseDto"
}
}
}
}
}
}
},
"/api/RescueRequest/{id}/cancel": {
"patch": {
"tags": [
"RescueRequest"
],
"summary": "Nguoi dan tu huy yeu cau cuu ho",
"description": "Cho phep chinh chu yeu cau huy khi request con o trang thai Pending (chua duoc gan team). Can cung cap ly do huy. Sau khi huy, mot RequestVerification ghi lu ly do se duoc tao.",
"operationId": "CancelMyRescueRequest",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CancelRescueRequestDto"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CancelRescueRequestDto"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CancelRescueRequestDto"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestResponseDto"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestResponseDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestResponseDto"
}
}
}
},
"400": {
"description": "Bad Request",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              }
            }
          },
          "401": {
            "description": "Unauthorized",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/RescueRequest/{id}/team-location": {
"get": {
"tags": [
"RescueRequest"
],
"summary": "Xem vi tri realtime cua doi cuu ho (khong can dang nhap)",
"description": "Nguoi dan truy cap bang RequestId de xem to do moi nhat cua doi cuu ho dang tren duong den. Tra ve null neu chua co team nao duoc gan hoac team chua bat dau di chuyen. Khong bao gom thong tin ca nhan cua thanh vien team.",
"operationId": "GetTeamLocationForRequest",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.TeamLocationForRequestDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.TeamLocationForRequestDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.TeamLocationForRequestDto"
                }
              }
            }
          },
          "404": {
            "description": "Not Found",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/Microsoft.AspNetCore.Mvc.ProblemDetails"
}
}
}
}
}
}
},
"/api/RescueRequest/stats": {
"get": {
"tags": [
"RescueRequest"
],
"summary": "Thong ke tong hop rescue request theo trang thai",
"description": "Tra ve so luong tong va so luong chi tiet theo tung trang thai (Pending, Verified, Assigned, InProgress, Completed, Cancelled). Dung de ve bieu do dashboard cho Moderator/Admin.",
"operationId": "GetRescueRequestStats",
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestStatsDto"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestStatsDto"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestStatsDto"
                }
              }
            }
          }
        }
      }
    },
    "/api/RescueRequest/teams/{teamId}/history": {
      "get": {
        "tags": [
          "RescueRequest"
        ],
        "summary": "Lich su ca cuu ho (batch) da hoan thanh cua team",
        "description": "Lay danh sach cac ca truc (RescueBatch) da ket thuc cua team, sap xep moi nhat truoc, co phan trang. Moi batch bao gom danh sach cac rescue request da xu ly trong ca do. Dung cho man hinh 'Lich su ca truc' cua tinh nguyen vien va moderator.",
        "operationId": "GetTeamRescueHistory",
        "parameters": [
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "pageNumber",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueTeamHistoryResponseDto"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueTeamHistoryResponseDto"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueTeamHistoryResponseDto"
}
}
}
}
}
}
},
"/api/Skill": {
"get": {
"tags": [
"Skill"
],
"description": "Lấy danh sách kỹ năng có phân trang và tìm kiếm theo Code, Name, Description",
"operationId": "GetAllSkills",
"parameters": [
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Skill.Dtos.SkillResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Skill.Dtos.SkillResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Skill.Dtos.SkillResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
}
}
}
}
},
"post": {
"tags": [
"Skill"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.CreateSkillRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.CreateSkillRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.CreateSkillRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.SkillResponse"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.SkillResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.SkillResponse"
}
}
}
}
}
}
},
"/api/Skill/{id}": {
"get": {
"tags": [
"Skill"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.SkillResponse"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.SkillResponse"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.SkillResponse"
                }
              }
            }
          }
        }
      },
      "put": {
        "tags": [
          "Skill"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.UpdateSkillRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.UpdateSkillRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.UpdateSkillRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
},
"delete": {
"tags": [
"Skill"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/StationJoinRequest": {
"post": {
"tags": [
"StationJoinRequest"
],
"description": "Team leader tạo yêu cầu xin team vào trạm",
"operationId": "CreateStationJoinRequest",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.StationJoinRequest.DTOs.Request.CreateStationJoinRequestRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.StationJoinRequest.DTOs.Request.CreateStationJoinRequestRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.StationJoinRequest.DTOs.Request.CreateStationJoinRequestRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/StationJoinRequest/{id}": {
      "get": {
        "tags": [
          "StationJoinRequest"
        ],
        "description": "Lấy chi tiết yêu cầu xin vào trạm",
        "operationId": "GetStationJoinRequestById",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/StationJoinRequest/my-requests": {
      "get": {
        "tags": [
          "StationJoinRequest"
        ],
        "description": "Leader xem các yêu cầu đã gửi vào trạm",
        "operationId": "GetMyStationJoinRequests",
        "parameters": [
          {
            "name": "pageIndex",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/StationJoinRequest/{id}/cancel": {
      "patch": {
        "tags": [
          "StationJoinRequest"
        ],
        "description": "Leader hủy yêu cầu xin vào trạm khi đang pending",
        "operationId": "CancelStationJoinRequest",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/StationJoinRequest/station/{stationId}/pending": {
      "get": {
        "tags": [
          "StationJoinRequest"
        ],
        "description": "Trưởng trạm xem danh sách request pending",
        "operationId": "GetPendingStationJoinRequests",
        "parameters": [
          {
            "name": "stationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "pageIndex",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/StationJoinRequest/{id}/approve": {
      "patch": {
        "tags": [
          "StationJoinRequest"
        ],
        "description": "Trưởng trạm duyệt yêu cầu xin vào trạm",
        "operationId": "ApproveStationJoinRequest",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.StationJoinRequest.DTOs.Request.ReviewStationJoinRequestRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.StationJoinRequest.DTOs.Request.ReviewStationJoinRequestRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.StationJoinRequest.DTOs.Request.ReviewStationJoinRequestRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/StationJoinRequest/{id}/reject": {
      "patch": {
        "tags": [
          "StationJoinRequest"
        ],
        "description": "Trưởng trạm từ chối yêu cầu xin vào trạm kèm lý do",
        "operationId": "RejectStationJoinRequest",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.StationJoinRequest.DTOs.Request.ReviewStationJoinRequestRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.StationJoinRequest.DTOs.Request.ReviewStationJoinRequestRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.StationJoinRequest.DTOs.Request.ReviewStationJoinRequestRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/SupplyAllocation": {
"post": {
"tags": [
"SupplyAllocation"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyAllocation.DTOs.Request.CreateSupplyAllocationRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyAllocation.DTOs.Request.CreateSupplyAllocationRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyAllocation.DTOs.Request.CreateSupplyAllocationRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/SupplyAllocation/{id}": {
      "get": {
        "tags": [
          "SupplyAllocation"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/SupplyAllocation/by-campaign/{campaignId}": {
      "get": {
        "tags": [
          "SupplyAllocation"
        ],
        "parameters": [
          {
            "name": "campaignId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/SupplyAllocation/by-inventory/{inventoryId}": {
      "get": {
        "tags": [
          "SupplyAllocation"
        ],
        "parameters": [
          {
            "name": "inventoryId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/SupplyAllocation/by-status": {
      "get": {
        "tags": [
          "SupplyAllocation"
        ],
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.SupplyAllocationStatus"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/SupplyAllocation/{id}/status": {
"patch": {
"tags": [
"SupplyAllocation"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyAllocation.DTOs.Request.UpdateAllocationStatusRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyAllocation.DTOs.Request.UpdateAllocationStatusRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyAllocation.DTOs.Request.UpdateAllocationStatusRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/SupplyItem": {
      "post": {
        "tags": [
          "SupplyItem"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyItem.DTOs.Request.CreateSupplyItemRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyItem.DTOs.Request.CreateSupplyItemRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyItem.DTOs.Request.CreateSupplyItemRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
},
"get": {
"tags": [
"SupplyItem"
],
"parameters": [
{
"name": "category",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.SupplyCategory"
}
},
{
"name": "pageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32",
"default": 1
}
},
{
"name": "pageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32",
"default": 20
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/SupplyItem/{id}": {
"get": {
"tags": [
"SupplyItem"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"put": {
"tags": [
"SupplyItem"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyItem.DTOs.Request.UpdateSupplyItemRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyItem.DTOs.Request.UpdateSupplyItemRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyItem.DTOs.Request.UpdateSupplyItemRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "delete": {
        "tags": [
          "SupplyItem"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/SupplyTransfer": {
      "post": {
        "tags": [
          "SupplyTransfer"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CreateSupplyTransferRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CreateSupplyTransferRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CreateSupplyTransferRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/SupplyTransfer/{id}": {
      "get": {
        "tags": [
          "SupplyTransfer"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/SupplyTransfer/by-status": {
      "get": {
        "tags": [
          "SupplyTransfer"
        ],
        "parameters": [
          {
            "name": "status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.SupplyTransferStatus"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/SupplyTransfer/by-source-station/{stationId}": {
"get": {
"tags": [
"SupplyTransfer"
],
"parameters": [
{
"name": "stationId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/SupplyTransfer/by-destination-station/{stationId}": {
"get": {
"tags": [
"SupplyTransfer"
],
"parameters": [
{
"name": "stationId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/SupplyTransfer/{id}/approve": {
"patch": {
"tags": [
"SupplyTransfer"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ApproveSupplyTransferRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ApproveSupplyTransferRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ApproveSupplyTransferRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/SupplyTransfer/{id}/ship": {
      "patch": {
        "tags": [
          "SupplyTransfer"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ShipSupplyTransferRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ShipSupplyTransferRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ShipSupplyTransferRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/SupplyTransfer/{id}/receive": {
      "patch": {
        "tags": [
          "SupplyTransfer"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ReceiveSupplyTransferRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ReceiveSupplyTransferRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ReceiveSupplyTransferRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/SupplyTransfer/{id}/cancel": {
"patch": {
"tags": [
"SupplyTransfer"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CancelSupplyTransferRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CancelSupplyTransferRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CancelSupplyTransferRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/SupplyTransfer/{id}/evidence-urls": {
      "put": {
        "tags": [
          "SupplyTransfer"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ReplaceSupplyTransferEvidenceUrlsRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ReplaceSupplyTransferEvidenceUrlsRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ReplaceSupplyTransferEvidenceUrlsRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/SupplyTransfer/{id}/evidences": {
      "post": {
        "tags": [
          "SupplyTransfer"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.AppendSupplyTransferEvidenceUrlsRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.AppendSupplyTransferEvidenceUrlsRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.AppendSupplyTransferEvidenceUrlsRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/SupplyTransfer/{id}/documents": {
"post": {
"tags": [
"SupplyTransfer"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CreateSupplyTransferDocumentRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CreateSupplyTransferDocumentRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CreateSupplyTransferDocumentRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Team": {
      "post": {
        "tags": [
          "Team"
        ],
        "description": "Moderator tạo team mới. Bắt buộc chọn TeamType: Relief (cứu trợ) hoặc Rescue (cứu hộ). Team Rescue chỉ được tham gia luồng cứu hộ.",
        "operationId": "CreateTeam",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.CreateTeamRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.CreateTeamRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.CreateTeamRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "get": {
        "tags": [
          "Team"
        ],
        "description": "Lấy danh sách tất cả teams có phân trang và tìm kiếm theo Name, Description, ContactPhone. Hỗ trợ lọc theo TeamType.",
        "operationId": "GetAllTeams",
        "parameters": [
          {
            "name": "Search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Name",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "Status",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TeamStatus"
}
},
{
"name": "TeamType",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TeamType"
            }
          },
          {
            "name": "ModeratorId",
            "in": "query",
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "PageIndex",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Team/{id}": {
      "get": {
        "tags": [
          "Team"
        ],
        "description": "Lấy thông tin chi tiết team",
        "operationId": "GetTeamById",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "put": {
        "tags": [
          "Team"
        ],
        "description": "Moderator cập nhật thông tin team",
        "operationId": "UpdateTeam",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.UpdateTeamRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.UpdateTeamRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.UpdateTeamRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
},
"delete": {
"tags": [
"Team"
],
"description": "Moderator xóa team",
"operationId": "DeleteTeam",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Team/search": {
"get": {
"tags": [
"Team"
],
"description": "Tìm kiếm teams có phân trang theo Search (Name, Description, ContactPhone), Name, Status, TeamType, ModeratorId",
"operationId": "SearchTeams",
"parameters": [
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "Name",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "Status",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TeamStatus"
}
},
{
"name": "TeamType",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TeamType"
}
},
{
"name": "ModeratorId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Team/in-station": {
"get": {
"tags": [
"Team"
],
"description": "Lấy danh sách team trong trạm, hỗ trợ phân trang + tìm theo tên team/leader",
"operationId": "GetTeamsInStation",
"parameters": [
{
"name": "ReliefStationId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Team/my-teams": {
"get": {
"tags": [
"Team"
],
"description": "Moderator lấy tất cả teams mình quản lý bao gồm thông tin members",
"operationId": "GetMyTeams",
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Team/my-team": {
"get": {
"tags": [
"Team"
],
"description": "Volunteer lấy team mà mình đang tham gia",
"operationId": "GetMyTeam",
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Team/{id}/members": {
"get": {
"tags": [
"Team"
],
"description": "Lấy danh sách members của team",
"operationId": "GetTeamMembers",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"post": {
"tags": [
"Team"
],
"description": "Moderator thêm volunteer vào team trực tiếp",
"operationId": "AddMemberDirectly",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.AddMemberRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.AddMemberRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.AddMemberRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Team/{id}/members/bulk": {
      "post": {
        "tags": [
          "Team"
        ],
        "description": "Moderator thêm 1 hoặc nhiều volunteer vào team trong một request",
        "operationId": "AddMembersDirectly",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.AddMembersRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.AddMembersRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.AddMembersRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Team/{id}/members/{userId}/promote-to-leader": {
      "patch": {
        "tags": [
          "Team"
        ],
        "description": "Moderator cập nhật role của member lên Leader",
        "operationId": "PromoteMemberToLeader",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Team/{id}/members/{userId}": {
      "delete": {
        "tags": [
          "Team"
        ],
        "description": "Moderator xóa member khỏi team",
        "operationId": "RemoveMember",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Team/{id}/tracking-heartbeat": {
      "post": {
        "tags": [
          "Team"
        ],
        "description": "Volunteer gửi heartbeat vị trí team với đầy đủ trường tracking: tọa độ, độ chính xác, tốc độ, hướng, nguồn, thời điểm ghi nhận, rescue batch/operation và ghi chú",
        "operationId": "TrackTeamHeartbeat",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.TeamTrackingHeartbeatRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.TeamTrackingHeartbeatRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Team.DTOs.Request.TeamTrackingHeartbeatRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Team/{id}/tracking/latest": {
"get": {
"tags": [
"Team"
],
"description": "Lấy danh sách điểm tracking mới nhất của team để hiển thị realtime/replay trên bản đồ",
"operationId": "GetLatestTeamTracking",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "limit",
"in": "query",
"schema": {
"type": "integer",
"format": "int32",
"default": 100
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/TeamJoinRequest": {
"post": {
"tags": [
"TeamJoinRequest"
],
"description": "Volunteer tạo yêu cầu tham gia team",
"operationId": "CreateTeamJoinRequest",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.TeamJoinRequest.DTOs.Request.CreateTeamJoinRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.TeamJoinRequest.DTOs.Request.CreateTeamJoinRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.TeamJoinRequest.DTOs.Request.CreateTeamJoinRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/TeamJoinRequest/{id}": {
      "get": {
        "tags": [
          "TeamJoinRequest"
        ],
        "description": "Lấy chi tiết yêu cầu tham gia team",
        "operationId": "GetTeamJoinRequestById",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/TeamJoinRequest/my-requests": {
      "get": {
        "tags": [
          "TeamJoinRequest"
        ],
        "description": "Volunteer xem danh sách yêu cầu của mình và trạng thái có phân trang",
        "operationId": "GetMyTeamJoinRequests",
        "parameters": [
          {
            "name": "pageIndex",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 1
            }
          },
          {
            "name": "pageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32",
              "default": 10
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/TeamJoinRequest/{id}/cancel": {
      "patch": {
        "tags": [
          "TeamJoinRequest"
        ],
        "description": "Volunteer hủy yêu cầu tham gia team",
        "operationId": "CancelTeamJoinRequest",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/TeamJoinRequest/{id}/approve": {
      "patch": {
        "tags": [
          "TeamJoinRequest"
        ],
        "description": "Moderator duyệt yêu cầu tham gia team. Update ApprovedAt, ApprovedBy, ReviewNote và Status",
        "operationId": "ApproveTeamJoinRequest",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.TeamJoinRequest.DTOs.Request.ReviewTeamJoinRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.TeamJoinRequest.DTOs.Request.ReviewTeamJoinRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.TeamJoinRequest.DTOs.Request.ReviewTeamJoinRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/TeamJoinRequest/{id}/reject": {
      "patch": {
        "tags": [
          "TeamJoinRequest"
        ],
        "description": "Moderator từ chối yêu cầu tham gia team. Update RejectedAt, RejectedBy, ReviewNote và Status",
        "operationId": "RejectTeamJoinRequest",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.TeamJoinRequest.DTOs.Request.ReviewTeamJoinRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.TeamJoinRequest.DTOs.Request.ReviewTeamJoinRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.TeamJoinRequest.DTOs.Request.ReviewTeamJoinRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/TeamJoinRequest/team/{teamId}": {
"get": {
"tags": [
"TeamJoinRequest"
],
"description": "Moderator xem yêu cầu tham gia của volunteers có skills xin vào team của mình có phân trang",
"operationId": "GetTeamJoinRequestsByTeam",
"parameters": [
{
"name": "teamId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
},
{
"name": "pageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32",
"default": 1
}
},
{
"name": "pageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32",
"default": 10
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/User/profile": {
"get": {
"tags": [
"User"
],
"description": "Lấy thông tin profile của user đang đăng nhập",
"operationId": "GetProfile",
"responses": {
"200": {
"description": "OK"
}
}
},
"put": {
"tags": [
"User"
],
"description": "Cập nhật thông tin profile của user đang đăng nhập (partial update)",
"operationId": "UpdateUserProfile",
"requestBody": {
"content": {
"multipart/form-data": {
"schema": {
"type": "object",
"properties": {
"DisplayName": {
"type": "string"
},
"PhoneNumber": {
"type": "string"
},
"Address": {
"type": "string"
},
"DateOfBirth": {
"type": "string",
"format": "date-time"
},
"Gender": {
"type": "string"
},
"PictureUrl": {
"type": "string"
},
"PicturePublicId": {
"type": "string"
}
}
},
"encoding": {
"DisplayName": {
"style": "form"
},
"PhoneNumber": {
"style": "form"
},
"Address": {
"style": "form"
},
"DateOfBirth": {
"style": "form"
},
"Gender": {
"style": "form"
},
"PictureUrl": {
"style": "form"
},
"PicturePublicId": {
"style": "form"
}
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/User/all": {
"get": {
"tags": [
"User"
],
"description": "Admin lấy danh sách tất cả users có phân trang, tìm kiếm theo DisplayName/Email/PhoneNumber, lọc theo Role và trạng thái bị ban",
"operationId": "GetAllProfiles",
"parameters": [
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "Role",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "IsBanned",
"in": "query",
"schema": {
"type": "boolean"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/User/moderators": {
"get": {
"tags": [
"User"
],
"description": "Admin lấy danh sách moderator có phân trang, hỗ trợ tìm kiếm và lọc bị ban/không bị ban; kèm trường IsManagingStation",
"operationId": "GetModerators",
"parameters": [
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "IsBanned",
"in": "query",
"schema": {
"type": "boolean"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"post": {
"tags": [
"User"
],
"description": "Admin tạo account Moderator và moderator profile",
"operationId": "CreateModeratorAccount",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.CreateModeratorAccountRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.CreateModeratorAccountRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.CreateModeratorAccountRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/User/moderators/{userId}": {
      "get": {
        "tags": [
          "User"
        ],
        "description": "Admin lấy chi tiết account Moderator",
        "operationId": "GetModeratorById",
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "put": {
        "tags": [
          "User"
        ],
        "description": "Admin cập nhật account Moderator và moderator profile",
        "operationId": "UpdateModeratorAccount",
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.UpdateModeratorAccountRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.UpdateModeratorAccountRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.UpdateModeratorAccountRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "delete": {
        "tags": [
          "User"
        ],
        "description": "Admin soft delete account Moderator bằng cách khóa tài khoản và đánh dấu profile dismissed",
        "operationId": "SoftDeleteModeratorAccount",
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.SoftDeletePrivilegedAccountRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.SoftDeletePrivilegedAccountRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.SoftDeletePrivilegedAccountRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/User/managers": {
"get": {
"tags": [
"User"
],
"description": "Admin lấy danh sách manager có phân trang",
"operationId": "GetManagers",
"parameters": [
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "IsBanned",
"in": "query",
"schema": {
"type": "boolean"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"post": {
"tags": [
"User"
],
"description": "Admin tạo account Manager và manager profile",
"operationId": "CreateManagerAccount",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.CreateManagerAccountRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.CreateManagerAccountRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.CreateManagerAccountRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/User/managers/{userId}": {
      "get": {
        "tags": [
          "User"
        ],
        "description": "Admin lấy chi tiết account Manager",
        "operationId": "GetManagerById",
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "put": {
        "tags": [
          "User"
        ],
        "description": "Admin cập nhật account Manager và manager profile",
        "operationId": "UpdateManagerAccount",
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.UpdateManagerAccountRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.UpdateManagerAccountRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.UpdateManagerAccountRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "delete": {
        "tags": [
          "User"
        ],
        "description": "Admin soft delete account Manager bằng cách khóa tài khoản",
        "operationId": "SoftDeleteManagerAccount",
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.SoftDeletePrivilegedAccountRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.SoftDeletePrivilegedAccountRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.SoftDeletePrivilegedAccountRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/User/my-volunteer-profile": {
"get": {
"tags": [
"User"
],
"description": "Lấy hồ sơ volunteer của user đang đăng nhập",
"operationId": "GetMyVolunteerProfile",
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/User/{userId}/ban": {
"put": {
"tags": [
"User"
],
"description": "Admin khóa tài khoản user và lưu lý do bị ban",
"operationId": "BanUser",
"parameters": [
{
"name": "userId",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.BanUserRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.BanUserRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.BanUserRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/User/{userId}/unban": {
      "put": {
        "tags": [
          "User"
        ],
        "description": "Admin mở khóa tài khoản user",
        "operationId": "UnbanUser",
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.UnbanUserRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.UnbanUserRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.User.UnbanUserRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Vehicle": {
      "post": {
        "tags": [
          "Vehicle"
        ],
        "summary": "Tạo phương tiện",
        "description": "Role behavior:\n- Manager: Có thể tạo xe với hoặc không gán trạm (ReliefStationId có thể null).\n- Moderator: Khi tạo xe sẽ tự động gán vào trạm của moderator, giá trị ReliefStationId từ request sẽ bị bỏ qua.\n- TeamId chỉ hợp lệ khi team đã được duyệt tại trạm của xe.",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Vehicle.DTOs.Request.CreateVehicleRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Vehicle.DTOs.Request.CreateVehicleRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Vehicle.DTOs.Request.CreateVehicleRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
},
"get": {
"tags": [
"Vehicle"
],
"summary": "Lấy danh sách phương tiện",
"description": "Role behavior:\n- Manager: Xem toàn bộ phương tiện, có thể lọc theo ReliefStationId.\n- Moderator: Chỉ xem phương tiện thuộc trạm của mình (tự động scope theo trạm, bỏ qua ReliefStationId từ query).\n- Hỗ trợ tìm kiếm theo LicensePlate, TeamName, ReliefStationName, VehicleTypeName và phân trang.",
"operationId": "GetAllVehicles",
"parameters": [
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "ReliefStationId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Vehicle.DTOs.Response.VehicleResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Vehicle.DTOs.Response.VehicleResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Vehicle.DTOs.Response.VehicleResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
}
}
}
}
}
},
"/api/Vehicle/counts": {
"get": {
"tags": [
"Vehicle"
],
"summary": "Thống kê phương tiện theo trạng thái",
"description": "Chỉ Manager được truy cập. Nếu truyền stationId thì thống kê trong 1 trạm; nếu không truyền thì thống kê toàn hệ thống.",
"parameters": [
{
"name": "stationId",
"in": "query",
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/Vehicle/{id}": {
"get": {
"tags": [
"Vehicle"
],
"summary": "Lấy chi tiết phương tiện",
"description": "Role behavior:\n- Manager: Xem được phương tiện bất kỳ.\n- Moderator: Chỉ xem được phương tiện thuộc trạm của mình.",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
},
"put": {
"tags": [
"Vehicle"
],
"summary": "Cập nhật phương tiện",
"description": "Role behavior:\n- Manager: Có thể cập nhật mọi phương tiện.\n- Moderator: Chỉ cập nhật phương tiện thuộc trạm của mình.\n- User khác role trên: chỉ cập nhật phương tiện do chính mình tạo.",
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Vehicle.DTOs.Request.UpdateVehicleRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Vehicle.DTOs.Request.UpdateVehicleRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Vehicle.DTOs.Request.UpdateVehicleRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "delete": {
        "tags": [
          "Vehicle"
        ],
        "summary": "Xóa mềm phương tiện",
        "description": "Role behavior:\n- Manager: Xóa được mọi phương tiện.\n- Moderator: Chỉ xóa phương tiện thuộc trạm của mình.\n- User khác role trên: chỉ xóa phương tiện do chính mình tạo.\nThao tác là soft delete (IsDeleted = true).",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Vehicle/status/{status}": {
      "get": {
        "tags": [
          "Vehicle"
        ],
        "summary": "Lấy phương tiện theo trạng thái",
        "description": "Role behavior:\n- Manager: Xem theo trạng thái trên toàn hệ thống.\n- Moderator: Chỉ xem phương tiện theo trạng thái trong trạm của mình.\nStatus: 1 = Free, 2 = Busy.",
        "parameters": [
          {
            "name": "status",
            "in": "path",
            "required": true,
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Vehicle/my-vehicles": {
      "get": {
        "tags": [
          "Vehicle"
        ],
        "summary": "Lấy phương tiện do user hiện tại tạo",
        "description": "Endpoint này trả về danh sách theo CreatedBy của user hiện tại, không phải scope theo role/trạm.",
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Vehicle/{id}/assign-station/{stationId}": {
      "put": {
        "tags": [
          "Vehicle"
        ],
        "summary": "Gán phương tiện vào trạm",
        "description": "Chỉ Manager được gọi endpoint này. Dùng cho luồng manager tạo xe trước rồi gán trạm sau. Nếu xe đang có TeamId thì team đó phải được duyệt tại trạm đích.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "stationId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/Vehicle/{id}/assign-team/{teamId}": {
      "put": {
        "tags": [
          "Vehicle"
        ],
        "summary": "Gán phương tiện vào team",
        "description": "Chỉ Moderator được gọi. Moderator chỉ gán team cho phương tiện thuộc trạm của mình và team phải được duyệt tại đúng trạm đó.",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          },
          {
            "name": "teamId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      }
    },
    "/api/VehicleType": {
      "post": {
        "tags": [
          "VehicleType"
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VehicleType.DTOs.Request.CreateVehicleTypeRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VehicleType.DTOs.Request.CreateVehicleTypeRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VehicleType.DTOs.Request.CreateVehicleTypeRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "get": {
        "tags": [
          "VehicleType"
        ],
        "description": "Lấy danh sách loại phương tiện có phân trang và tìm kiếm theo TypeName, Description",
        "operationId": "GetAllVehicleTypes",
        "parameters": [
          {
            "name": "PageIndex",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "Search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VehicleType.DTOs.Response.VehicleTypeResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VehicleType.DTOs.Response.VehicleTypeResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VehicleType.DTOs.Response.VehicleTypeResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              }
            }
          }
        }
      }
    },
    "/api/VehicleType/{id}": {
      "get": {
        "tags": [
          "VehicleType"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "put": {
        "tags": [
          "VehicleType"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VehicleType.DTOs.Request.UpdateVehicleTypeRequest"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VehicleType.DTOs.Request.UpdateVehicleTypeRequest"
              }
            },
            "application/*+json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VehicleType.DTOs.Request.UpdateVehicleTypeRequest"
}
}
}
},
"responses": {
"200": {
"description": "OK"
}
}
},
"delete": {
"tags": [
"VehicleType"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK"
}
}
}
},
"/api/VolunteerProfile": {
"post": {
"tags": [
"VolunteerProfile"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.CreateVolunteerRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.CreateVolunteerRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.CreateVolunteerRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK"
          }
        }
      },
      "get": {
        "tags": [
          "VolunteerProfile"
        ],
        "description": "Lấy danh sách hồ sơ volunteer có phân trang và tìm kiếm theo FullName(DisplayName), Email, PhoneNumber",
        "operationId": "GetAllVolunteerProfiles",
        "parameters": [
          {
            "name": "PageIndex",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "PageSize",
            "in": "query",
            "schema": {
              "type": "integer",
              "format": "int32"
            }
          },
          {
            "name": "Search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              }
            }
          }
        }
      }
    },
    "/api/VolunteerProfile/my-profile": {
      "get": {
        "tags": [
          "VolunteerProfile"
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
}
}
}
}
}
}
},
"/api/VolunteerProfile/my-profile/resubmit": {
"put": {
"tags": [
"VolunteerProfile"
],
"description": "Volunteer chỉnh sửa và gửi lại hồ sơ đã bị từ chối. Hồ sơ sẽ quay về Pending để moderator duyệt lại.",
"operationId": "ResubmitVolunteerProfile",
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.ResubmitVolunteerRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.ResubmitVolunteerRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.ResubmitVolunteerRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
}
}
}
}
}
}
},
"/api/VolunteerProfile/unassigned": {
"get": {
"tags": [
"VolunteerProfile"
],
"description": "Lấy danh sách volunteer chưa tham gia team nào (có phân trang)",
"operationId": "GetUnassignedVolunteers",
"parameters": [
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
}
}
}
}
}
},
"/api/VolunteerProfile/unassigned/all": {
"get": {
"tags": [
"VolunteerProfile"
],
"description": "Lấy TẤT CẢ danh sách volunteer chưa tham gia team nào (không phân trang)",
"operationId": "GetAllUnassignedVolunteers",
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
}
}
},
"text/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/VolunteerProfile/pending-applications": {
      "get": {
        "tags": [
          "VolunteerProfile"
        ],
        "parameters": [
          {
            "name": "Search",
            "in": "query",
            "schema": {
              "type": "string"
            }
          },
          {
            "name": "VerificationStatus",
            "in": "query",
            "schema": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.VerificationStatus"
}
},
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerApplicationReviewResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerApplicationReviewResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerApplicationReviewResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
}
}
}
}
}
},
"/api/VolunteerProfile/review-applications": {
"get": {
"tags": [
"VolunteerProfile"
],
"parameters": [
{
"name": "Search",
"in": "query",
"schema": {
"type": "string"
}
},
{
"name": "VerificationStatus",
"in": "query",
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.VerificationStatus"
}
},
{
"name": "PageIndex",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
},
{
"name": "PageSize",
"in": "query",
"schema": {
"type": "integer",
"format": "int32"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerApplicationReviewResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerApplicationReviewResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerApplicationReviewResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]"
}
}
}
}
}
}
},
"/api/VolunteerProfile/{id}/approve": {
"put": {
"tags": [
"VolunteerProfile"
],
"parameters": [
{
"name": "id",
"in": "path",
"required": true,
"schema": {
"type": "string",
"format": "uuid"
}
}
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
                }
              },
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
}
},
"text/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
                }
              }
            }
          }
        }
      }
    },
    "/api/VolunteerProfile/{id}/reject": {
      "put": {
        "tags": [
          "VolunteerProfile"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string",
              "format": "uuid"
            }
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "string"
              }
            },
            "text/json": {
              "schema": {
                "type": "string"
              }
            },
            "application/*+json": {
              "schema": {
                "type": "string"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
}
}
}
}
}
}
},
"/api/VolunteerProfile/skills": {
"post": {
"tags": [
"VolunteerProfile"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.AddVolunteerRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.AddVolunteerRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.AddVolunteerRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
}
}
}
}
}
},
"delete": {
"tags": [
"VolunteerProfile"
],
"requestBody": {
"content": {
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.RemoveVolunteerSkillRequest"
              }
            },
            "text/json": {
              "schema": {
                "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.RemoveVolunteerSkillRequest"
}
},
"application/_+json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.RemoveVolunteerSkillRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "text/plain": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
}
},
"application/json": {
"schema": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
                }
              },
              "text/json": {
                "schema": {
                  "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
}
}
}
}
}
},
"get": {
"tags": [
"VolunteerProfile"
],
"responses": {
"200": {
"description": "OK",
"content": {
"text/plain": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerSkillResponse"
                  }
                }
              },
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerSkillResponse"
}
}
},
"text/json": {
"schema": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerSkillResponse"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Microsoft.AspNetCore.Mvc.ProblemDetails": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "nullable": true
          },
          "title": {
            "type": "string",
            "nullable": true
          },
          "status": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "detail": {
            "type": "string",
            "nullable": true
          },
          "instance": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": { }
      },
      "ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]": {
        "type": "object",
        "properties": {
          "currentPage": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "totalPages": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "totalCount": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "hasPrevious": {
            "type": "boolean",
            "readOnly": true
          },
          "hasNext": {
            "type": "boolean",
            "readOnly": true
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.CampaignHouseholdResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]": {
        "type": "object",
        "properties": {
          "currentPage": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "totalPages": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "totalCount": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "hasPrevious": {
            "type": "boolean",
            "readOnly": true
          },
          "hasNext": {
            "type": "boolean",
            "readOnly": true
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Response.CampaignHouseholdResponse"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.DistributionPointResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]": {
"type": "object",
"properties": {
"currentPage": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"totalPages": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"pageSize": {
"type": "integer",
"format": "int32"
},
"totalCount": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"hasPrevious": {
"type": "boolean",
"readOnly": true
},
"hasNext": {
"type": "boolean",
"readOnly": true
},
"items": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Response.DistributionPointResponse"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdChecklistItemResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]": {
        "type": "object",
        "properties": {
          "currentPage": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "totalPages": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "totalCount": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "hasPrevious": {
            "type": "boolean",
            "readOnly": true
          },
          "hasNext": {
            "type": "boolean",
            "readOnly": true
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdChecklistItemResponse"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdDeliveryResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]": {
        "type": "object",
        "properties": {
          "currentPage": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "totalPages": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "totalCount": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "hasPrevious": {
            "type": "boolean",
            "readOnly": true
          },
          "hasNext": {
            "type": "boolean",
            "readOnly": true
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdDeliveryResponse"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Relief.DTOs.Response.ReliefPackageDefinitionResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]": {
"type": "object",
"properties": {
"currentPage": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"totalPages": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"pageSize": {
"type": "integer",
"format": "int32"
},
"totalCount": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"hasPrevious": {
"type": "boolean",
"readOnly": true
},
"hasNext": {
"type": "boolean",
"readOnly": true
},
"items": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Response.ReliefPackageDefinitionResponse"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Skill.Dtos.SkillResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]": {
        "type": "object",
        "properties": {
          "currentPage": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "totalPages": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "totalCount": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "hasPrevious": {
            "type": "boolean",
            "readOnly": true
          },
          "hasNext": {
            "type": "boolean",
            "readOnly": true
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Skill.Dtos.SkillResponse"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.Vehicle.DTOs.Response.VehicleResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]": {
        "type": "object",
        "properties": {
          "currentPage": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "totalPages": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "totalCount": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "hasPrevious": {
            "type": "boolean",
            "readOnly": true
          },
          "hasNext": {
            "type": "boolean",
            "readOnly": true
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Vehicle.DTOs.Response.VehicleResponse"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VehicleType.DTOs.Response.VehicleTypeResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]": {
"type": "object",
"properties": {
"currentPage": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"totalPages": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"pageSize": {
"type": "integer",
"format": "int32"
},
"totalCount": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"hasPrevious": {
"type": "boolean",
"readOnly": true
},
"hasNext": {
"type": "boolean",
"readOnly": true
},
"items": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VehicleType.DTOs.Response.VehicleTypeResponse"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerApplicationReviewResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]": {
        "type": "object",
        "properties": {
          "currentPage": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "totalPages": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "totalCount": {
            "type": "integer",
            "format": "int32",
            "readOnly": true
          },
          "hasPrevious": {
            "type": "boolean",
            "readOnly": true
          },
          "hasNext": {
            "type": "boolean",
            "readOnly": true
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerApplicationReviewResponse"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Common.Models.Pagination`1[[ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse, ReliefManagementSystem.Application, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null]]": {
"type": "object",
"properties": {
"currentPage": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"totalPages": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"pageSize": {
"type": "integer",
"format": "int32"
},
"totalCount": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"hasPrevious": {
"type": "boolean",
"readOnly": true
},
"hasNext": {
"type": "boolean",
"readOnly": true
},
"items": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Auth.DTOs.AuthResponse": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "accessToken": {
            "type": "string",
            "nullable": true
          },
          "refreshToken": {
            "type": "string",
            "nullable": true
          },
          "accessTokenExpires": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "message": {
            "type": "string",
            "nullable": true
          },
          "resetToken": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Auth.DTOs.ChangePasswordRequest": {
        "type": "object",
        "properties": {
          "currentPassword": {
            "type": "string",
            "nullable": true
          },
          "newPassword": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Auth.DTOs.LoginPhoneRequest": {
        "type": "object",
        "properties": {
          "phoneNumber": {
            "type": "string",
            "nullable": true
          },
          "password": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Auth.DTOs.LoginRequest": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "nullable": true
          },
          "password": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Auth.DTOs.LogoutRequest": {
        "type": "object",
        "properties": {
          "refreshToken": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Auth.DTOs.RefreshTokenRequest": {
        "type": "object",
        "properties": {
          "refreshToken": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Auth.DTOs.RegisterRequest": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "nullable": true
          },
          "userName": {
            "type": "string",
            "nullable": true
          },
          "password": {
            "type": "string",
            "nullable": true
          },
          "phoneNumber": {
            "type": "string",
            "nullable": true
          },
          "fullName": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Auth.DTOs.ResendEmailOtpRequest": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Auth.DTOs.ResetPasswordByTokenRequest": {
        "required": [
          "email",
          "newPassword",
          "resetToken"
        ],
        "type": "object",
        "properties": {
          "email": {
            "minLength": 1,
            "type": "string",
            "format": "email"
          },
          "resetToken": {
            "minLength": 1,
            "type": "string"
          },
          "newPassword": {
            "minLength": 6,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Auth.DTOs.SendForgotPasswordOtpRequest": {
        "required": [
          "email"
        ],
        "type": "object",
        "properties": {
          "email": {
            "minLength": 1,
            "type": "string",
            "format": "email"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Auth.DTOs.VerifyEmailOtpRequest": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "nullable": true
          },
          "code": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Auth.DTOs.VerifyForgotPasswordOtpRequest": {
        "required": [
          "email",
          "otpCode"
        ],
        "type": "object",
        "properties": {
          "email": {
            "minLength": 1,
            "type": "string",
            "format": "email"
          },
          "otpCode": {
            "maxLength": 6,
            "minLength": 6,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.AssignCampaignTeamRequest": {
        "required": [
          "role",
          "teamId"
        ],
        "type": "object",
        "properties": {
          "teamId": {
            "type": "string",
            "format": "uuid"
          },
          "role": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.CampaignTeamRole"
},
"initialStatus": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.CampaignTeamStatus"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.AttachCampaignStationRequest": {
        "required": [
          "reliefStationId"
        ],
        "type": "object",
        "properties": {
          "reliefStationId": {
            "type": "string",
            "format": "uuid"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.CampaignGoalRequest": {
        "required": [
          "resourceType"
        ],
        "type": "object",
        "properties": {
          "resourceType": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.CampaignResourceType"
},
"targetAmount": {
"minimum": 0,
"type": "number",
"format": "double"
},
"isRequired": {
"type": "boolean"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.ChangeCampaignStatusRequest": {
"required": [
"status"
],
"type": "object",
"properties": {
"status": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.CampaignStatus"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.CreateCampaignRequest": {
        "required": [
          "endDate",
          "locationId",
          "name",
          "startDate",
          "type"
        ],
        "type": "object",
        "properties": {
          "name": {
            "maxLength": 255,
            "minLength": 1,
            "type": "string"
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "locationId": {
            "type": "string",
            "format": "uuid"
          },
          "startDate": {
            "type": "string",
            "format": "date-time"
          },
          "endDate": {
            "type": "string",
            "format": "date-time"
          },
          "latitude": {
            "type": "number",
            "format": "double"
          },
          "longitude": {
            "type": "number",
            "format": "double"
          },
          "areaRadiusKm": {
            "type": "number",
            "format": "double"
          },
          "addressDetail": {
            "type": "string",
            "nullable": true
          },
          "type": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.CampaignType"
},
"completionRule": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.CampaignCompletionRule"
          },
          "allowOverTarget": {
            "type": "boolean"
          },
          "goals": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.CampaignGoalRequest"
},
"nullable": true
},
"availablePeopleCount": {
"maximum": 2147483647,
"minimum": 0,
"type": "integer",
"format": "int32"
},
"reliefStationId": {
"type": "string",
"format": "uuid",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.UpdateCampaignRequest": {
"required": [
"endDate",
"name",
"startDate"
],
"type": "object",
"properties": {
"name": {
"maxLength": 255,
"minLength": 1,
"type": "string"
},
"description": {
"type": "string",
"nullable": true
},
"startDate": {
"type": "string",
"format": "date-time"
},
"endDate": {
"type": "string",
"format": "date-time"
},
"latitude": {
"type": "number",
"format": "double"
},
"longitude": {
"type": "number",
"format": "double"
},
"areaRadiusKm": {
"type": "number",
"format": "double"
},
"addressDetail": {
"type": "string",
"nullable": true
},
"allowOverTarget": {
"type": "boolean"
},
"completionRule": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.CampaignCompletionRule"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Campaign.Dtos.Requests.UpdateCampaignTeamStatusRequest": {
        "required": [
          "status"
        ],
        "type": "object",
        "properties": {
          "status": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.CampaignTeamStatus"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Request.AnalyzeDisasterRiskRequest": {
"type": "object",
"properties": {
"latitude": {
"type": "number",
"format": "double"
},
"longitude": {
"type": "number",
"format": "double"
},
"disasterType": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DisasterType"
          },
          "locationName": {
            "type": "string",
            "nullable": true
          },
          "additionalContext": {
            "type": "string",
            "nullable": true
          },
          "model": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Response.AiDisasterNarrativeDto": {
        "type": "object",
        "properties": {
          "succeeded": {
            "type": "boolean"
          },
          "provider": {
            "type": "string",
            "nullable": true
          },
          "model": {
            "type": "string",
            "nullable": true
          },
          "promptVersion": {
            "type": "string",
            "nullable": true
          },
          "analyzedAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "primaryRiskType": {
            "type": "string",
            "nullable": true
          },
          "summary": {
            "type": "string",
            "nullable": true
          },
          "detailedAnalysis": {
            "type": "string",
            "nullable": true
          },
          "recommendations": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          },
          "potentialScenarios": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          },
          "errorMessage": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Response.AnalyzeDisasterRiskResponse": {
        "type": "object",
        "properties": {
          "analysisLogId": {
            "type": "string",
            "format": "uuid"
          },
          "latitude": {
            "type": "number",
            "format": "double"
          },
          "longitude": {
            "type": "number",
            "format": "double"
          },
          "locationName": {
            "type": "string",
            "nullable": true
          },
          "analysisMode": {
            "type": "string",
            "nullable": true
          },
          "requestedDisasterType": {
            "type": "string",
            "nullable": true
          },
          "primaryDisasterType": {
            "type": "string",
            "nullable": true
          },
          "weather": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Response.WeatherSnapshotDto"
},
"riskRanking": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Response.DisasterRiskRankingDto"
            },
            "nullable": true
          },
          "heuristic": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Response.HeuristicRiskAssessmentDto"
},
"ai": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Response.AiDisasterNarrativeDto"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Response.DisasterRiskRankingDto": {
        "type": "object",
        "properties": {
          "disasterType": {
            "type": "string",
            "nullable": true
          },
          "riskScore": {
            "type": "integer",
            "format": "int32"
          },
          "riskLevel": {
            "type": "string",
            "nullable": true
          },
          "assessmentConfidence": {
            "type": "string",
            "nullable": true
          },
          "triggerFactors": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          },
          "topThreats": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Response.HeuristicRiskAssessmentDto": {
        "type": "object",
        "properties": {
          "overallRiskScore": {
            "type": "integer",
            "format": "int32"
          },
          "riskLevel": {
            "type": "string",
            "nullable": true
          },
          "assessmentConfidence": {
            "type": "string",
            "nullable": true
          },
          "dataLimitationNote": {
            "type": "string",
            "nullable": true
          },
          "triggerFactors": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          },
          "potentialScenarios": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          },
          "topThreats": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.DisasterAnalysis.DTOs.Response.WeatherSnapshotDto": {
        "type": "object",
        "properties": {
          "observedAt": {
            "type": "string",
            "format": "date-time"
          },
          "condition": {
            "type": "string",
            "nullable": true
          },
          "temperatureC": {
            "type": "number",
            "format": "double"
          },
          "windKph": {
            "type": "number",
            "format": "double"
          },
          "precipMm": {
            "type": "number",
            "format": "double"
          },
          "visibilityKm": {
            "type": "number",
            "format": "double"
          },
          "humidity": {
            "type": "integer",
            "format": "int32"
          },
          "baseWeatherRiskScore": {
            "type": "integer",
            "format": "int32"
          },
          "baseWeatherRiskLevel": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Donation.DTOs.Request.CreateDonationCheckoutRequest": {
        "required": [
          "campaignId",
          "donorName"
        ],
        "type": "object",
        "properties": {
          "campaignId": {
            "type": "string",
            "format": "uuid"
          },
          "amount": {
            "maximum": 1000000000,
            "minimum": 1000,
            "type": "number",
            "format": "double"
          },
          "donorName": {
            "maxLength": 255,
            "minLength": 1,
            "type": "string"
          },
          "message": {
            "maxLength": 1000,
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Donation.DTOs.Request.PayOsWebhookData": {
        "type": "object",
        "properties": {
          "orderCode": {
            "type": "integer",
            "format": "int64"
          },
          "amount": {
            "type": "number",
            "format": "double"
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "accountNumber": {
            "type": "string",
            "nullable": true
          },
          "reference": {
            "type": "string",
            "nullable": true
          },
          "transactionDateTime": {
            "type": "string",
            "nullable": true
          },
          "currency": {
            "type": "string",
            "nullable": true
          },
          "paymentLinkId": {
            "type": "string",
            "nullable": true
          },
          "code": {
            "type": "string",
            "nullable": true
          },
          "desc": {
            "type": "string",
            "nullable": true
          },
          "counterAccountBankId": {
            "type": "string",
            "nullable": true
          },
          "counterAccountBankName": {
            "type": "string",
            "nullable": true
          },
          "counterAccountName": {
            "type": "string",
            "nullable": true
          },
          "counterAccountNumber": {
            "type": "string",
            "nullable": true
          },
          "virtualAccountName": {
            "type": "string",
            "nullable": true
          },
          "virtualAccountNumber": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Donation.DTOs.Request.PayOsWebhookRequest": {
        "type": "object",
        "properties": {
          "code": {
            "type": "string",
            "nullable": true
          },
          "desc": {
            "type": "string",
            "nullable": true
          },
          "success": {
            "type": "boolean"
          },
          "data": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Donation.DTOs.Request.PayOsWebhookData"
},
"signature": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.AddStockItemRequest": {
"required": [
"supplyItemId"
],
"type": "object",
"properties": {
"supplyItemId": {
"type": "string",
"format": "uuid"
},
"currentQuantity": {
"maximum": 2147483647,
"minimum": 0,
"type": "integer",
"format": "int32"
},
"minimumStockLevel": {
"maximum": 2147483647,
"minimum": 0,
"type": "integer",
"format": "int32"
},
"maximumStockLevel": {
"maximum": 2147483647,
"minimum": 1,
"type": "integer",
"format": "int32"
},
"expirationDate": {
"type": "string",
"format": "date-time",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.CreateInventoryRequest": {
"required": [
"level",
"reliefStationId"
],
"type": "object",
"properties": {
"reliefStationId": {
"type": "string",
"format": "uuid"
},
"level": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.InventoryLevel"
          },
          "status": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.EntityStatus"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.UpdateInventoryRequest": {
"required": [
"level",
"status"
],
"type": "object",
"properties": {
"level": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.InventoryLevel"
          },
          "status": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.EntityStatus"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Inventory.DTOs.Request.UpdateStockItemRequest": {
"type": "object",
"properties": {
"minimumStockLevel": {
"maximum": 2147483647,
"minimum": 0,
"type": "integer",
"format": "int32"
},
"maximumStockLevel": {
"maximum": 2147483647,
"minimum": 1,
"type": "integer",
"format": "int32"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.InventoryTransaction.DTOs.Request.CreateTransactionRequest": {
"required": [
"inventoryId",
"items",
"reason",
"type"
],
"type": "object",
"properties": {
"inventoryId": {
"type": "string",
"format": "uuid"
},
"supplyTransferId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"type": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TransactionType"
          },
          "reason": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TransactionReason"
},
"notes": {
"maxLength": 500,
"type": "string",
"nullable": true
},
"items": {
"minItems": 1,
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.InventoryTransaction.DTOs.Request.TransactionItemRequest"
            }
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.InventoryTransaction.DTOs.Request.TransactionItemRequest": {
        "required": [
          "supplyItemId"
        ],
        "type": "object",
        "properties": {
          "supplyItemId": {
            "type": "string",
            "format": "uuid"
          },
          "quantity": {
            "maximum": 2147483647,
            "minimum": 1,
            "type": "integer",
            "format": "int32"
          },
          "notes": {
            "maxLength": 200,
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Request.CreatePriorityCriteriaRequest": {
        "required": [
          "code",
          "disasterType",
          "name",
          "point"
        ],
        "type": "object",
        "properties": {
          "name": {
            "minLength": 1,
            "type": "string"
          },
          "point": {
            "type": "integer",
            "format": "int32"
          },
          "disasterType": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DisasterType"
},
"code": {
"minLength": 1,
"type": "string"
},
"description": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Request.UpdatePriorityCriteriaRequest": {
"required": [
"code",
"disasterType",
"name",
"point",
"status"
],
"type": "object",
"properties": {
"name": {
"minLength": 1,
"type": "string"
},
"point": {
"type": "integer",
"format": "int32"
},
"disasterType": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DisasterType"
          },
          "code": {
            "minLength": 1,
            "type": "string"
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "status": {
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.PriorityCriteria.DTOs.Response.PriorityCriteriaResponse": {
        "type": "object",
        "properties": {
          "priorityCriteriaId": {
            "type": "string",
            "format": "uuid"
          },
          "name": {
            "type": "string",
            "nullable": true
          },
          "point": {
            "type": "integer",
            "format": "int32"
          },
          "disasterType": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DisasterType"
},
"code": {
"type": "string",
"nullable": true
},
"description": {
"type": "string",
"nullable": true
},
"status": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.ApproveProcurementOrderRequest": {
"type": "object",
"properties": {
"approvalNote": {
"maxLength": 500,
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.CreateProcurementOrderItemRequest": {
"required": [
"supplyItemId"
],
"type": "object",
"properties": {
"supplyItemId": {
"type": "string",
"format": "uuid"
},
"quantity": {
"maximum": 2147483647,
"minimum": 1,
"type": "integer",
"format": "int32"
},
"unitCost": {
"minimum": 0.01,
"type": "number",
"format": "double"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.CreateProcurementOrderRequest": {
"required": [
"campaignId",
"destinationInventoryId",
"items"
],
"type": "object",
"properties": {
"campaignId": {
"type": "string",
"format": "uuid"
},
"destinationInventoryId": {
"type": "string",
"format": "uuid"
},
"supplierName": {
"maxLength": 255,
"type": "string",
"nullable": true
},
"supplierContact": {
"maxLength": 100,
"type": "string",
"nullable": true
},
"notes": {
"maxLength": 500,
"type": "string",
"nullable": true
},
"items": {
"minItems": 1,
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.CreateProcurementOrderItemRequest"
            }
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.ReceiveProcurementOrderItemRequest": {
        "required": [
          "supplyItemId"
        ],
        "type": "object",
        "properties": {
          "supplyItemId": {
            "type": "string",
            "format": "uuid"
          },
          "receivedQuantity": {
            "maximum": 2147483647,
            "minimum": 1,
            "type": "integer",
            "format": "int32"
          },
          "actualUnitCost": {
            "minimum": 0.01,
            "type": "number",
            "format": "double"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.ReceiveProcurementOrderRequest": {
        "required": [
          "items"
        ],
        "type": "object",
        "properties": {
          "receiveNote": {
            "maxLength": 500,
            "type": "string",
            "nullable": true
          },
          "items": {
            "minItems": 1,
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Procurement.Dtos.Requests.ReceiveProcurementOrderItemRequest"
}
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ApprovedSupplyShortageItemRequest": {
"required": [
"supplyItemId"
],
"type": "object",
"properties": {
"supplyItemId": {
"type": "string",
"format": "uuid"
},
"quantityApproved": {
"maximum": 2147483647,
"minimum": 0,
"type": "integer",
"format": "int32"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Request.AssembleReliefPackageRequest": {
"required": [
"inventoryId",
"reliefStationId"
],
"type": "object",
"properties": {
"reliefStationId": {
"type": "string",
"format": "uuid"
},
"inventoryId": {
"type": "string",
"format": "uuid"
},
"quantityToAssemble": {
"maximum": 2147483647,
"minimum": 1,
"type": "integer",
"format": "int32"
},
"notes": {
"maxLength": 1000,
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Request.AssignHouseholdRequest": {
"required": [
"deliveryMode"
],
"type": "object",
"properties": {
"deliveryMode": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DeliveryMode"
          },
          "distributionPointId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "campaignTeamId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "reliefPackageDefinitionId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "scheduledAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "notes": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CompleteHouseholdDeliveryBatchItemRequest": {
        "required": [
          "householdDeliveryId",
          "proofs"
        ],
        "type": "object",
        "properties": {
          "householdDeliveryId": {
            "type": "string",
            "format": "uuid"
          },
          "reliefPackageDefinitionId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "campaignTeamId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "notes": {
            "type": "string",
            "nullable": true
          },
          "proofs": {
            "minItems": 1,
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CompleteHouseholdDeliveryProofRequest"
}
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CompleteHouseholdDeliveryBatchRequest": {
"required": [
"items"
],
"type": "object",
"properties": {
"items": {
"minItems": 1,
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CompleteHouseholdDeliveryBatchItemRequest"
            }
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CompleteHouseholdDeliveryProofRequest": {
        "required": [
          "fileUrl"
        ],
        "type": "object",
        "properties": {
          "fileUrl": {
            "maxLength": 1000,
            "minLength": 1,
            "type": "string"
          },
          "fileType": {
            "maxLength": 200,
            "type": "string",
            "nullable": true
          },
          "note": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CompleteHouseholdDeliveryRequest": {
        "required": [
          "proofFileUrl"
        ],
        "type": "object",
        "properties": {
          "reliefPackageDefinitionId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "campaignTeamId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "notes": {
            "type": "string",
            "nullable": true
          },
          "proofNote": {
            "type": "string",
            "nullable": true
          },
          "proofFileUrl": {
            "maxLength": 1000,
            "minLength": 1,
            "type": "string"
          },
          "proofContentType": {
            "maxLength": 200,
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CreateDistributionPointRequest": {
        "required": [
          "name",
          "reliefStationId",
          "startsAt"
        ],
        "type": "object",
        "properties": {
          "name": {
            "maxLength": 255,
            "minLength": 1,
            "type": "string"
          },
          "reliefStationId": {
            "type": "string",
            "format": "uuid"
          },
          "campaignTeamId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "locationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "address": {
            "maxLength": 500,
            "type": "string",
            "nullable": true
          },
          "latitude": {
            "type": "number",
            "format": "double"
          },
          "longitude": {
            "type": "number",
            "format": "double"
          },
          "deliveryMode": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DeliveryMode"
},
"startsAt": {
"type": "string",
"format": "date-time"
},
"endsAt": {
"type": "string",
"format": "date-time",
"nullable": true
},
"isActive": {
"type": "boolean"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CreateReliefPackageDefinitionRequest": {
"required": [
"items",
"name",
"outputSupplyItemId"
],
"type": "object",
"properties": {
"name": {
"maxLength": 255,
"minLength": 1,
"type": "string"
},
"description": {
"maxLength": 1000,
"type": "string",
"nullable": true
},
"outputSupplyItemId": {
"type": "string",
"format": "uuid"
},
"isDefault": {
"type": "boolean"
},
"isActive": {
"type": "boolean"
},
"items": {
"minItems": 1,
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ReliefPackageDefinitionItemRequest"
            }
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Relief.DTOs.Request.CreateSupplyShortageRequest": {
        "required": [
          "items"
        ],
        "type": "object",
        "properties": {
          "distributionPointId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "campaignTeamId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "reason": {
            "type": "string",
            "nullable": true
          },
          "items": {
            "minItems": 1,
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.SupplyShortageItemRequest"
}
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ImportCampaignHouseholdsRequest": {
"required": [
"households"
],
"type": "object",
"properties": {
"households": {
"minItems": 1,
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ReliefHouseholdInputRequest"
            }
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ReliefHouseholdInputRequest": {
        "required": [
          "headOfHouseholdName",
          "householdCode"
        ],
        "type": "object",
        "properties": {
          "householdCode": {
            "maxLength": 100,
            "minLength": 1,
            "type": "string"
          },
          "headOfHouseholdName": {
            "maxLength": 255,
            "minLength": 1,
            "type": "string"
          },
          "contactPhone": {
            "maxLength": 50,
            "type": "string",
            "nullable": true
          },
          "address": {
            "maxLength": 500,
            "type": "string",
            "nullable": true
          },
          "latitude": {
            "type": "number",
            "format": "double"
          },
          "longitude": {
            "type": "number",
            "format": "double"
          },
          "householdSize": {
            "maximum": 2147483647,
            "minimum": 1,
            "type": "integer",
            "format": "int32"
          },
          "isIsolated": {
            "type": "boolean"
          },
          "deliveryMode": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DeliveryMode"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ReliefPackageDefinitionItemRequest": {
"required": [
"supplyItemId",
"unit"
],
"type": "object",
"properties": {
"supplyItemId": {
"type": "string",
"format": "uuid"
},
"quantity": {
"maximum": 2147483647,
"minimum": 1,
"type": "integer",
"format": "int32"
},
"unit": {
"maxLength": 50,
"minLength": 1,
"type": "string"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ReviewSupplyShortageRequest": {
"type": "object",
"properties": {
"reviewNote": {
"type": "string",
"nullable": true
},
"approvedItems": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ApprovedSupplyShortageItemRequest"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Relief.DTOs.Request.SupplyShortageItemRequest": {
        "required": [
          "supplyItemId"
        ],
        "type": "object",
        "properties": {
          "supplyItemId": {
            "type": "string",
            "format": "uuid"
          },
          "quantityRequested": {
            "maximum": 2147483647,
            "minimum": 1,
            "type": "integer",
            "format": "int32"
          },
          "note": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Relief.DTOs.Request.UpdateCampaignHouseholdRequest": {
        "type": "object",
        "properties": {
          "householdCode": {
            "maxLength": 100,
            "type": "string",
            "nullable": true
          },
          "headOfHouseholdName": {
            "maxLength": 255,
            "type": "string",
            "nullable": true
          },
          "contactPhone": {
            "maxLength": 50,
            "type": "string",
            "nullable": true
          },
          "address": {
            "maxLength": 500,
            "type": "string",
            "nullable": true
          },
          "latitude": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "longitude": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "householdSize": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "isIsolated": {
            "type": "boolean",
            "nullable": true
          },
          "deliveryMode": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DeliveryMode"
},
"distributionPointId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"campaignTeamId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"notes": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Request.UpdateDistributionPointRequest": {
"type": "object",
"properties": {
"name": {
"maxLength": 255,
"type": "string",
"nullable": true
},
"reliefStationId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"campaignTeamId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"locationId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"address": {
"maxLength": 500,
"type": "string",
"nullable": true
},
"latitude": {
"type": "number",
"format": "double",
"nullable": true
},
"longitude": {
"type": "number",
"format": "double",
"nullable": true
},
"deliveryMode": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DeliveryMode"
          },
          "startsAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "endsAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "isActive": {
            "type": "boolean",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Relief.DTOs.Request.UpdateReliefPackageDefinitionRequest": {
        "type": "object",
        "properties": {
          "name": {
            "maxLength": 255,
            "type": "string",
            "nullable": true
          },
          "description": {
            "maxLength": 1000,
            "type": "string",
            "nullable": true
          },
          "outputSupplyItemId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "isDefault": {
            "type": "boolean",
            "nullable": true
          },
          "isActive": {
            "type": "boolean",
            "nullable": true
          },
          "items": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Request.ReliefPackageDefinitionItemRequest"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Response.CampaignHouseholdResponse": {
"type": "object",
"properties": {
"campaignHouseholdId": {
"type": "string",
"format": "uuid"
},
"campaignId": {
"type": "string",
"format": "uuid"
},
"distributionPointId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"campaignTeamId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"householdCode": {
"type": "string",
"nullable": true
},
"headOfHouseholdName": {
"type": "string",
"nullable": true
},
"contactPhone": {
"type": "string",
"nullable": true
},
"address": {
"type": "string",
"nullable": true
},
"latitude": {
"type": "number",
"format": "double"
},
"longitude": {
"type": "number",
"format": "double"
},
"householdSize": {
"type": "integer",
"format": "int32"
},
"isIsolated": {
"type": "boolean"
},
"deliveryMode": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DeliveryMode"
          },
          "fulfillmentStatus": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.HouseholdFulfillmentStatus"
},
"notes": {
"type": "string",
"nullable": true
},
"createdAt": {
"type": "string",
"format": "date-time"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Response.DistributionPointResponse": {
"type": "object",
"properties": {
"distributionPointId": {
"type": "string",
"format": "uuid"
},
"campaignId": {
"type": "string",
"format": "uuid"
},
"reliefStationId": {
"type": "string",
"format": "uuid"
},
"campaignTeamId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"locationId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"name": {
"type": "string",
"nullable": true
},
"address": {
"type": "string",
"nullable": true
},
"latitude": {
"type": "number",
"format": "double"
},
"longitude": {
"type": "number",
"format": "double"
},
"deliveryMode": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DeliveryMode"
          },
          "startsAt": {
            "type": "string",
            "format": "date-time"
          },
          "endsAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "isActive": {
            "type": "boolean"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdChecklistItemResponse": {
        "type": "object",
        "properties": {
          "householdDeliveryId": {
            "type": "string",
            "format": "uuid"
          },
          "campaignId": {
            "type": "string",
            "format": "uuid"
          },
          "campaignHouseholdId": {
            "type": "string",
            "format": "uuid"
          },
          "householdCode": {
            "type": "string",
            "nullable": true
          },
          "headOfHouseholdName": {
            "type": "string",
            "nullable": true
          },
          "campaignTeamId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "distributionPointId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "reliefPackageDefinitionId": {
            "type": "string",
            "format": "uuid"
          },
          "deliveryMode": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DeliveryMode"
},
"status": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.HouseholdFulfillmentStatus"
          },
          "scheduledAt": {
            "type": "string",
            "format": "date-time"
          },
          "deliveredAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "notes": {
            "type": "string",
            "nullable": true
          },
          "proofCount": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdDeliveryProofResponse": {
        "type": "object",
        "properties": {
          "householdDeliveryProofId": {
            "type": "string",
            "format": "uuid"
          },
          "fileUrl": {
            "type": "string",
            "nullable": true
          },
          "fileType": {
            "type": "string",
            "nullable": true
          },
          "note": {
            "type": "string",
            "nullable": true
          },
          "capturedAt": {
            "type": "string",
            "format": "date-time"
          },
          "capturedByUserId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdDeliveryResponse": {
        "type": "object",
        "properties": {
          "householdDeliveryId": {
            "type": "string",
            "format": "uuid"
          },
          "campaignId": {
            "type": "string",
            "format": "uuid"
          },
          "campaignHouseholdId": {
            "type": "string",
            "format": "uuid"
          },
          "distributionPointId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "campaignTeamId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "reliefPackageDefinitionId": {
            "type": "string",
            "format": "uuid"
          },
          "deliveredByUserId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "deliveryMode": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.DeliveryMode"
},
"status": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.HouseholdFulfillmentStatus"
          },
          "scheduledAt": {
            "type": "string",
            "format": "date-time"
          },
          "deliveredAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "notes": {
            "type": "string",
            "nullable": true
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "proofs": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Response.HouseholdDeliveryProofResponse"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Response.ReliefPackageDefinitionItemResponse": {
"type": "object",
"properties": {
"reliefPackageDefinitionItemId": {
"type": "string",
"format": "uuid"
},
"supplyItemId": {
"type": "string",
"format": "uuid"
},
"supplyItemName": {
"type": "string",
"nullable": true
},
"quantity": {
"type": "integer",
"format": "int32"
},
"unit": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Relief.DTOs.Response.ReliefPackageDefinitionResponse": {
"type": "object",
"properties": {
"reliefPackageDefinitionId": {
"type": "string",
"format": "uuid"
},
"campaignId": {
"type": "string",
"format": "uuid"
},
"outputSupplyItemId": {
"type": "string",
"format": "uuid"
},
"outputSupplyItemName": {
"type": "string",
"nullable": true
},
"outputUnit": {
"type": "string",
"nullable": true
},
"name": {
"type": "string",
"nullable": true
},
"description": {
"type": "string",
"nullable": true
},
"isDefault": {
"type": "boolean"
},
"isActive": {
"type": "boolean"
},
"createdAt": {
"type": "string",
"format": "date-time"
},
"items": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.Relief.DTOs.Response.ReliefPackageDefinitionItemResponse"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.AssignModeratorRequest": {
        "required": [
          "moderatorUserId"
        ],
        "type": "object",
        "properties": {
          "moderatorUserId": {
            "type": "string",
            "format": "uuid"
          },
          "isStationHead": {
            "type": "boolean"
          },
          "status": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.ModeratorStatus"
},
"reason": {
"maxLength": 500,
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.AssignTeamRequest": {
"required": [
"teamId"
],
"type": "object",
"properties": {
"teamId": {
"type": "string",
"format": "uuid"
},
"description": {
"maxLength": 1000,
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.UpdateProvincialStationRequest": {
"required": [
"name"
],
"type": "object",
"properties": {
"name": {
"maxLength": 255,
"minLength": 1,
"type": "string"
},
"address": {
"maxLength": 500,
"type": "string",
"nullable": true
},
"contactNumber": {
"maxLength": 20,
"type": "string",
"nullable": true
},
"longitude": {
"type": "number",
"format": "double"
},
"latitude": {
"type": "number",
"format": "double"
},
"coverageRadiusKm": {
"maximum": 1000,
"minimum": 0.1,
"type": "number",
"format": "double"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.ReliefStation.DTOs.Request.UpdateTeamAssignmentRequest": {
"required": [
"status"
],
"type": "object",
"properties": {
"status": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.ReliefTeamAssignmentStatus"
          },
          "description": {
            "maxLength": 1000,
            "type": "string",
            "nullable": true
          },
          "rejectionReason": {
            "maxLength": 1000,
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.ReliefStation.Dtos.CreateProvincialReliefStationRequest": {
        "type": "object",
        "properties": {
          "locationId": {
            "type": "string",
            "format": "uuid"
          },
          "name": {
            "type": "string",
            "nullable": true
          },
          "address": {
            "type": "string",
            "nullable": true
          },
          "contactNumber": {
            "type": "string",
            "nullable": true
          },
          "longitude": {
            "type": "number",
            "format": "double"
          },
          "latitude": {
            "type": "number",
            "format": "double"
          },
          "coverageRadiusKm": {
            "type": "number",
            "format": "double"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.AssignRescueTeamBulkRequestDto": {
        "required": [
          "requestIds",
          "teamId"
        ],
        "type": "object",
        "properties": {
          "teamId": {
            "type": "string",
            "format": "uuid"
          },
          "requestIds": {
            "minItems": 1,
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            }
          },
          "note": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.AssignRescueTeamRequestDto": {
        "required": [
          "teamId"
        ],
        "type": "object",
        "properties": {
          "teamId": {
            "type": "string",
            "format": "uuid"
          },
          "note": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CancelRescueRequestDto": {
        "type": "object",
        "properties": {
          "reason": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CompleteRescueOperationRequestDto": {
        "required": [
          "attachments"
        ],
        "type": "object",
        "properties": {
          "attachments": {
            "minItems": 1,
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CompleteRescueOperationRequestDto.AttachmentItem"
}
},
"note": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CompleteRescueOperationRequestDto.AttachmentItem": {
"required": [
"contentType",
"fileUrl"
],
"type": "object",
"properties": {
"fileUrl": {
"minLength": 1,
"type": "string"
},
"contentType": {
"minLength": 1,
"type": "string"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CreateRescueRequestDto": {
"required": [
"disasterType",
"latitude",
"longitude",
"reporterPhone",
"rescueType"
],
"type": "object",
"properties": {
"rescueType": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.RescueRequestType"
          },
          "disasterType": {
            "type": "integer",
            "format": "int32"
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "latitude": {
            "maximum": 90,
            "minimum": -90,
            "type": "number",
            "format": "double"
          },
          "longitude": {
            "maximum": 180,
            "minimum": -180,
            "type": "number",
            "format": "double"
          },
          "accuracy": {
            "minimum": 0,
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "address": {
            "maxLength": 500,
            "type": "string",
            "nullable": true
          },
          "note": {
            "maxLength": 500,
            "type": "string",
            "nullable": true
          },
          "reporterFullName": {
            "maxLength": 200,
            "type": "string",
            "nullable": true
          },
          "reporterPhone": {
            "maxLength": 50,
            "minLength": 1,
            "type": "string"
          },
          "attachments": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CreateRescueRequestDto.AttachmentDto"
},
"nullable": true
},
"selectedPriorityCriteriaIds": {
"type": "array",
"items": {
"type": "string",
"format": "uuid"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.CreateRescueRequestDto.AttachmentDto": {
"required": [
"contentType",
"fileUrl"
],
"type": "object",
"properties": {
"fileUrl": {
"minLength": 1,
"type": "string"
},
"contentType": {
"minLength": 1,
"type": "string"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.DispatchPreviewRequestDto": {
"type": "object",
"properties": {
"teamId": {
"type": "string",
"format": "uuid"
},
"allowPreempt": {
"type": "boolean"
},
"normalNearRouteThresholdKm": {
"type": "number",
"format": "double"
},
"emergencyNearRouteThresholdKm": {
"type": "number",
"format": "double"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.ReorderRescueBatchRequestDto": {
"required": [
"requestIdsInOrder"
],
"type": "object",
"properties": {
"requestIdsInOrder": {
"minItems": 1,
"type": "array",
"items": {
"type": "string",
"format": "uuid"
}
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.SmartAssignRescueTeamRequestDto": {
"type": "object",
"properties": {
"teamId": {
"type": "string",
"format": "uuid"
},
"allowPreempt": {
"type": "boolean"
},
"normalNearRouteThresholdKm": {
"type": "number",
"format": "double"
},
"emergencyNearRouteThresholdKm": {
"type": "number",
"format": "double"
},
"note": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.UpdateRescueOperationStatusRequestDto": {
"type": "object",
"properties": {
"status": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.RescueOperationStatus"
          },
          "note": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Request.VerifyRescueRequestDto": {
        "type": "object",
        "properties": {
          "status": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.RequestVerificationStatus"
},
"method": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.VerificationMethod"
          },
          "note": {
            "type": "string",
            "nullable": true
          },
          "reason": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.AssignedRescueTeamDto": {
        "type": "object",
        "properties": {
          "rescueOperationId": {
            "type": "string",
            "format": "uuid"
          },
          "teamId": {
            "type": "string",
            "format": "uuid"
          },
          "teamName": {
            "type": "string",
            "nullable": true
          },
          "operationStatus": {
            "type": "string",
            "nullable": true
          },
          "currentLatitude": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "currentLongitude": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "lastTrackedAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "estimatedMinutesToArrival": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "distanceKmToVictim": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "routePolyline": {
            "type": "string",
            "nullable": true
          },
          "totalDistanceKm": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "totalEstimatedMinutes": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.AttachmentResponseDto": {
        "type": "object",
        "properties": {
          "attachmentId": {
            "type": "string",
            "format": "uuid"
          },
          "fileUrl": {
            "type": "string",
            "nullable": true
          },
          "contentType": {
            "type": "string",
            "nullable": true
          },
          "attachmentType": {
            "type": "string",
            "nullable": true
          },
          "uploadedAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.BulkAssignFailureItemDto": {
        "type": "object",
        "properties": {
          "requestId": {
            "type": "string",
            "format": "uuid"
          },
          "reason": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.BulkAssignRescueTeamResponseDto": {
        "type": "object",
        "properties": {
          "teamId": {
            "type": "string",
            "format": "uuid"
          },
          "totalRequested": {
            "type": "integer",
            "format": "int32"
          },
          "successCount": {
            "type": "integer",
            "format": "int32"
          },
          "failedCount": {
            "type": "integer",
            "format": "int32"
          },
          "successRequestIds": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "nullable": true
          },
          "failures": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.BulkAssignFailureItemDto"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.DispatchCandidateResponseDto": {
"type": "object",
"properties": {
"requestId": {
"type": "string",
"format": "uuid"
},
"userName": {
"type": "string",
"nullable": true
},
"reporterFullName": {
"type": "string",
"nullable": true
},
"reporterPhone": {
"type": "string",
"nullable": true
},
"rescueRequestType": {
"type": "string",
"nullable": true
},
"rescueRequestStatus": {
"type": "string",
"nullable": true
},
"priorityPoint": {
"type": "integer",
"format": "int32",
"nullable": true
},
"priorityLevel": {
"type": "string",
"nullable": true
},
"address": {
"type": "string",
"nullable": true
},
"latitude": {
"type": "number",
"format": "double"
},
"longitude": {
"type": "number",
"format": "double"
},
"alreadyAssignedTeamId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"isInOtherActiveBatch": {
"type": "boolean"
},
"canDispatch": {
"type": "boolean"
},
"dispatchBlockReason": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.DispatchPreviewResponseDto": {
"type": "object",
"properties": {
"requestId": {
"type": "string",
"format": "uuid"
},
"teamId": {
"type": "string",
"format": "uuid"
},
"eligible": {
"type": "boolean"
},
"recommendedAction": {
"type": "string",
"nullable": true
},
"willPreemptCurrentInProgress": {
"type": "boolean"
},
"currentInProgressRequestId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"currentInProgressBatchItemId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"newBatchItemId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"recommendedQueueIndex": {
"type": "integer",
"format": "int32"
},
"distanceFromTeamKm": {
"type": "number",
"format": "double",
"nullable": true
},
"distanceToCurrentInProgressKm": {
"type": "number",
"format": "double",
"nullable": true
},
"isNearCurrentRoute": {
"type": "boolean"
},
"requiresBacktrack": {
"type": "boolean"
},
"currentRoutePolyline": {
"type": "string",
"nullable": true
},
"currentRouteDistanceMeters": {
"type": "integer",
"format": "int32",
"nullable": true
},
"currentRouteDurationSeconds": {
"type": "integer",
"format": "int32",
"nullable": true
},
"minDistanceToCurrentRouteMeters": {
"type": "number",
"format": "double",
"nullable": true
},
"detourMeters": {
"type": "integer",
"format": "int32",
"nullable": true
},
"detourSeconds": {
"type": "integer",
"format": "int32",
"nullable": true
},
"rescueRequestType": {
"type": "string",
"nullable": true
},
"priorityPoint": {
"type": "integer",
"format": "int32",
"nullable": true
},
"priorityLevel": {
"type": "string",
"nullable": true
},
"reasons": {
"type": "array",
"items": {
"type": "string"
},
"nullable": true
},
"proposedRequestIdsInOrder": {
"type": "array",
"items": {
"type": "string",
"format": "uuid"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.PaginatedDispatchCandidatesResponseDto": {
"type": "object",
"properties": {
"totalCount": {
"type": "integer",
"format": "int32"
},
"pageNumber": {
"type": "integer",
"format": "int32"
},
"pageSize": {
"type": "integer",
"format": "int32"
},
"totalPages": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"hasPreviousPage": {
"type": "boolean",
"readOnly": true
},
"hasNextPage": {
"type": "boolean",
"readOnly": true
},
"data": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.DispatchCandidateResponseDto"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.PaginatedRescueRequestResponseDto": {
        "type": "object",
        "properties": {
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestResponseDto"
},
"nullable": true
},
"totalCount": {
"type": "integer",
"format": "int32"
},
"pageNumber": {
"type": "integer",
"format": "int32"
},
"pageSize": {
"type": "integer",
"format": "int32"
},
"totalPages": {
"type": "integer",
"format": "int32",
"readOnly": true
},
"hasPreviousPage": {
"type": "boolean",
"readOnly": true
},
"hasNextPage": {
"type": "boolean",
"readOnly": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RequestVerificationDto": {
"type": "object",
"properties": {
"requestVerificationId": {
"type": "string",
"format": "uuid"
},
"status": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.RequestVerificationStatus"
          },
          "method": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.VerificationMethod"
},
"note": {
"type": "string",
"nullable": true
},
"reason": {
"type": "string",
"nullable": true
},
"verifiedBy": {
"type": "string",
"format": "uuid",
"nullable": true
},
"verifiedAt": {
"type": "string",
"format": "date-time",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchHistoryItemDto": {
"type": "object",
"properties": {
"rescueBatchId": {
"type": "string",
"format": "uuid"
},
"createdAt": {
"type": "string",
"format": "date-time"
},
"closedAt": {
"type": "string",
"format": "date-time",
"nullable": true
},
"totalRequests": {
"type": "integer",
"format": "int32"
},
"completedRequests": {
"type": "integer",
"format": "int32"
},
"requests": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueCompletedRequestSummaryDto"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchQueueItemDto": {
        "type": "object",
        "properties": {
          "rescueBatchItemId": {
            "type": "string",
            "format": "uuid"
          },
          "rescueRequestId": {
            "type": "string",
            "format": "uuid"
          },
          "disasterType": {
            "type": "string",
            "nullable": true
          },
          "rescueRequestType": {
            "type": "string",
            "nullable": true
          },
          "rescueRequestStatus": {
            "type": "string",
            "nullable": true
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "address": {
            "type": "string",
            "nullable": true
          },
          "latitude": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "longitude": {
            "type": "number",
            "format": "double",
            "nullable": true
          },
          "reporterFullName": {
            "type": "string",
            "nullable": true
          },
          "reporterPhone": {
            "type": "string",
            "nullable": true
          },
          "priorityPoint": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "priorityLevel": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.RescuePriorityLevel"
},
"sequenceOrder": {
"type": "integer",
"format": "int32"
},
"isAutoAssigned": {
"type": "boolean"
},
"distanceKm": {
"type": "number",
"format": "double",
"nullable": true
},
"estimatedMinutes": {
"type": "integer",
"format": "int32",
"nullable": true
},
"status": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.RescueBatchItemStatus"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchQueueResponseDto": {
        "type": "object",
        "properties": {
          "rescueBatchId": {
            "type": "string",
            "format": "uuid"
          },
          "teamId": {
            "type": "string",
            "format": "uuid"
          },
          "isActive": {
            "type": "boolean"
          },
          "status": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.RescueBatchStatus"
},
"routePolyline": {
"type": "string",
"nullable": true
},
"totalDistanceKm": {
"type": "number",
"format": "double",
"nullable": true
},
"estimatedMinutes": {
"type": "integer",
"format": "int32",
"nullable": true
},
"createdAt": {
"type": "string",
"format": "date-time"
},
"closedAt": {
"type": "string",
"format": "date-time",
"nullable": true
},
"items": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchQueueItemDto"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueCompletedRequestSummaryDto": {
        "type": "object",
        "properties": {
          "requestId": {
            "type": "string",
            "format": "uuid"
          },
          "address": {
            "type": "string",
            "nullable": true
          },
          "disasterType": {
            "type": "string",
            "nullable": true
          },
          "rescueRequestType": {
            "type": "string",
            "nullable": true
          },
          "priority": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "priorityLevel": {
            "type": "string",
            "nullable": true
          },
          "rescueRequestStatus": {
            "type": "string",
            "nullable": true
          },
          "reporterFullName": {
            "type": "string",
            "nullable": true
          },
          "reporterPhone": {
            "type": "string",
            "nullable": true
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "sequenceOrder": {
            "type": "integer",
            "format": "int32"
          },
          "batchItemStatus": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueOperationDto": {
        "type": "object",
        "properties": {
          "rescueOperationId": {
            "type": "string",
            "format": "uuid"
          },
          "teamId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "teamName": {
            "type": "string",
            "nullable": true
          },
          "stationName": {
            "type": "string",
            "nullable": true
          },
          "status": {
            "type": "string",
            "nullable": true
          },
          "startedAt": {
            "type": "string",
            "format": "date-time"
          },
          "endedAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestPriorityDto": {
        "type": "object",
        "properties": {
          "criteriaName": {
            "type": "string",
            "nullable": true
          },
          "appliedPoint": {
            "type": "integer",
            "format": "int32"
          },
          "description": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestResponseDto": {
        "type": "object",
        "properties": {
          "requestId": {
            "type": "string",
            "format": "uuid"
          },
          "disasterType": {
            "type": "string",
            "nullable": true
          },
          "rescueRequestType": {
            "type": "string",
            "nullable": true
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "latitude": {
            "type": "number",
            "format": "double"
          },
          "longitude": {
            "type": "number",
            "format": "double"
          },
          "address": {
            "type": "string",
            "nullable": true
          },
          "reporterFullName": {
            "type": "string",
            "nullable": true
          },
          "reporterPhone": {
            "type": "string",
            "nullable": true
          },
          "priority": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "priorityLevel": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.RescuePriorityLevel"
},
"rescueRequestStatus": {
"type": "string",
"nullable": true
},
"dispatchMode": {
"type": "string",
"nullable": true
},
"note": {
"type": "string",
"nullable": true
},
"weatherCondition": {
"type": "string",
"nullable": true
},
"weatherTempC": {
"type": "number",
"format": "double",
"nullable": true
},
"weatherWindKph": {
"type": "number",
"format": "double",
"nullable": true
},
"weatherPrecipMm": {
"type": "number",
"format": "double",
"nullable": true
},
"weatherVisibilityKm": {
"type": "number",
"format": "double",
"nullable": true
},
"weatherRiskScore": {
"type": "integer",
"format": "int32",
"nullable": true
},
"weatherRiskLevel": {
"type": "string",
"nullable": true
},
"weatherObservedAt": {
"type": "string",
"format": "date-time",
"nullable": true
},
"campaignId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"campaignName": {
"type": "string",
"nullable": true
},
"stationToRequestDistanceKm": {
"type": "number",
"format": "double",
"nullable": true
},
"stationToRequestDurationMinutes": {
"type": "integer",
"format": "int32",
"nullable": true
},
"stationToRequestDistanceMeters": {
"type": "integer",
"format": "int32",
"nullable": true
},
"stationToRequestDurationSeconds": {
"type": "integer",
"format": "int32",
"nullable": true
},
"createdAt": {
"type": "string",
"format": "date-time"
},
"updatedAt": {
"type": "string",
"format": "date-time",
"nullable": true
},
"attachments": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.AttachmentResponseDto"
            },
            "nullable": true
          },
          "priorityDetails": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestPriorityDto"
},
"nullable": true
},
"rescueOperations": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueOperationDto"
            },
            "nullable": true
          },
          "verifications": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RequestVerificationDto"
},
"nullable": true
},
"assignedRescueTeam": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.AssignedRescueTeamDto"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueRequestStatsDto": {
        "type": "object",
        "properties": {
          "total": {
            "type": "integer",
            "format": "int32"
          },
          "pending": {
            "type": "integer",
            "format": "int32"
          },
          "verified": {
            "type": "integer",
            "format": "int32"
          },
          "assigned": {
            "type": "integer",
            "format": "int32"
          },
          "inProgress": {
            "type": "integer",
            "format": "int32"
          },
          "completed": {
            "type": "integer",
            "format": "int32"
          },
          "cancelled": {
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueTeamHistoryResponseDto": {
        "type": "object",
        "properties": {
          "totalCount": {
            "type": "integer",
            "format": "int32"
          },
          "pageNumber": {
            "type": "integer",
            "format": "int32"
          },
          "pageSize": {
            "type": "integer",
            "format": "int32"
          },
          "data": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.RescueBatchHistoryItemDto"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.RescueRequest.DTOs.Response.TeamLocationForRequestDto": {
"type": "object",
"properties": {
"rescueOperationId": {
"type": "string",
"format": "uuid"
},
"teamId": {
"type": "string",
"format": "uuid"
},
"teamName": {
"type": "string",
"nullable": true
},
"operationStatus": {
"type": "string",
"nullable": true
},
"currentLatitude": {
"type": "number",
"format": "double",
"nullable": true
},
"currentLongitude": {
"type": "number",
"format": "double",
"nullable": true
},
"lastTrackedAt": {
"type": "string",
"format": "date-time",
"nullable": true
},
"estimatedMinutesToArrival": {
"type": "integer",
"format": "int32",
"nullable": true
},
"distanceKmToVictim": {
"type": "number",
"format": "double",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Skill.Dtos.CreateSkillRequest": {
"type": "object",
"properties": {
"code": {
"type": "string",
"nullable": true
},
"name": {
"type": "string",
"nullable": true
},
"description": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Skill.Dtos.SkillResponse": {
"type": "object",
"properties": {
"skillId": {
"type": "string",
"format": "uuid"
},
"code": {
"type": "string",
"nullable": true
},
"name": {
"type": "string",
"nullable": true
},
"description": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Skill.Dtos.UpdateSkillRequest": {
"type": "object",
"properties": {
"name": {
"type": "string",
"nullable": true
},
"description": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.StationJoinRequest.DTOs.Request.CreateStationJoinRequestRequest": {
"type": "object",
"properties": {
"teamId": {
"type": "string",
"format": "uuid"
},
"reliefStationId": {
"type": "string",
"format": "uuid"
},
"description": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.StationJoinRequest.DTOs.Request.ReviewStationJoinRequestRequest": {
"type": "object",
"properties": {
"reviewNote": {
"type": "string",
"nullable": true
},
"rejectionReason": {
"maxLength": 1000,
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.SupplyAllocation.DTOs.Request.AllocationItemRequest": {
"required": [
"supplyItemId"
],
"type": "object",
"properties": {
"supplyItemId": {
"type": "string",
"format": "uuid"
},
"quantity": {
"maximum": 2147483647,
"minimum": 1,
"type": "integer",
"format": "int32"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.SupplyAllocation.DTOs.Request.CreateSupplyAllocationRequest": {
"required": [
"campaignId",
"items",
"sourceInventoryId"
],
"type": "object",
"properties": {
"campaignId": {
"type": "string",
"format": "uuid"
},
"sourceInventoryId": {
"type": "string",
"format": "uuid"
},
"items": {
"minItems": 1,
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyAllocation.DTOs.Request.AllocationItemRequest"
            }
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.SupplyAllocation.DTOs.Request.UpdateAllocationStatusRequest": {
        "required": [
          "status"
        ],
        "type": "object",
        "properties": {
          "status": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.SupplyAllocationStatus"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.SupplyItem.DTOs.Request.CreateSupplyItemRequest": {
"required": [
"category",
"name",
"unit"
],
"type": "object",
"properties": {
"name": {
"maxLength": 200,
"minLength": 1,
"type": "string"
},
"description": {
"maxLength": 500,
"type": "string",
"nullable": true
},
"iconUrl": {
"maxLength": 500,
"type": "string",
"nullable": true
},
"category": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.SupplyCategory"
          },
          "unit": {
            "maxLength": 50,
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.SupplyItem.DTOs.Request.UpdateSupplyItemRequest": {
        "required": [
          "category",
          "name",
          "unit"
        ],
        "type": "object",
        "properties": {
          "name": {
            "maxLength": 200,
            "minLength": 1,
            "type": "string"
          },
          "description": {
            "maxLength": 500,
            "type": "string",
            "nullable": true
          },
          "iconUrl": {
            "maxLength": 500,
            "type": "string",
            "nullable": true
          },
          "category": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.SupplyCategory"
},
"unit": {
"maxLength": 50,
"minLength": 1,
"type": "string"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.AppendSupplyTransferEvidenceUrlsRequest": {
"type": "object",
"properties": {
"evidenceUrls": {
"type": "array",
"items": {
"type": "string"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ApproveSupplyTransferRequest": {
"type": "object",
"properties": {
"notes": {
"maxLength": 1000,
"type": "string",
"nullable": true
},
"evidenceUrls": {
"type": "array",
"items": {
"type": "string"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CancelSupplyTransferRequest": {
"type": "object",
"properties": {
"notes": {
"maxLength": 1000,
"type": "string",
"nullable": true
},
"evidenceUrls": {
"type": "array",
"items": {
"type": "string"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CreateSupplyTransferDocumentRequest": {
"required": [
"documentType",
"fileUrl"
],
"type": "object",
"properties": {
"documentType": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.SupplyTransferDocumentType"
          },
          "fileUrl": {
            "maxLength": 2000,
            "minLength": 1,
            "type": "string"
          },
          "fileName": {
            "maxLength": 255,
            "type": "string",
            "nullable": true
          },
          "contentType": {
            "maxLength": 100,
            "type": "string",
            "nullable": true
          },
          "fileSizeBytes": {
            "type": "integer",
            "format": "int64",
            "nullable": true
          },
          "notes": {
            "maxLength": 1000,
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CreateSupplyTransferItemRequest": {
        "required": [
          "supplyItemId"
        ],
        "type": "object",
        "properties": {
          "supplyItemId": {
            "type": "string",
            "format": "uuid"
          },
          "quantity": {
            "maximum": 2147483647,
            "minimum": 1,
            "type": "integer",
            "format": "int32"
          },
          "notes": {
            "maxLength": 500,
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CreateSupplyTransferRequest": {
        "required": [
          "destinationStationId",
          "items",
          "reason",
          "sourceStationId"
        ],
        "type": "object",
        "properties": {
          "sourceStationId": {
            "type": "string",
            "format": "uuid"
          },
          "destinationStationId": {
            "type": "string",
            "format": "uuid"
          },
          "reason": {
            "maxLength": 1000,
            "minLength": 1,
            "type": "string"
          },
          "notes": {
            "maxLength": 1000,
            "type": "string",
            "nullable": true
          },
          "evidenceUrls": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          },
          "items": {
            "minItems": 1,
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.CreateSupplyTransferItemRequest"
}
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ReceiveSupplyTransferItemRequest": {
"required": [
"supplyItemId"
],
"type": "object",
"properties": {
"supplyItemId": {
"type": "string",
"format": "uuid"
},
"actualQuantity": {
"maximum": 2147483647,
"minimum": 0,
"type": "integer",
"format": "int32"
},
"notes": {
"maxLength": 500,
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ReceiveSupplyTransferRequest": {
"required": [
"items"
],
"type": "object",
"properties": {
"items": {
"minItems": 1,
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ReceiveSupplyTransferItemRequest"
            }
          },
          "notes": {
            "maxLength": 1000,
            "type": "string",
            "nullable": true
          },
          "evidenceUrls": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ReplaceSupplyTransferEvidenceUrlsRequest": {
        "type": "object",
        "properties": {
          "evidenceUrls": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.SupplyTransfer.DTOs.Request.ShipSupplyTransferRequest": {
        "type": "object",
        "properties": {
          "vehicleId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "driverUserId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "notes": {
            "maxLength": 1000,
            "type": "string",
            "nullable": true
          },
          "evidenceUrls": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Team.DTOs.Request.AddMemberRequest": {
        "type": "object",
        "properties": {
          "volunteerId": {
            "type": "string",
            "format": "uuid"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Team.DTOs.Request.AddMembersRequest": {
        "type": "object",
        "properties": {
          "volunteerIds": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Team.DTOs.Request.CreateTeamRequest": {
        "required": [
          "name"
        ],
        "type": "object",
        "properties": {
          "name": {
            "maxLength": 150,
            "minLength": 1,
            "type": "string"
          },
          "description": {
            "maxLength": 1000,
            "type": "string",
            "nullable": true
          },
          "contactPhone": {
            "maxLength": 20,
            "type": "string",
            "nullable": true
          },
          "teamType": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TeamType"
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.Team.DTOs.Request.TeamTrackingHeartbeatRequest": {
"type": "object",
"properties": {
"latitude": {
"maximum": 90,
"minimum": -90,
"type": "number",
"format": "double"
},
"longitude": {
"maximum": 180,
"minimum": -180,
"type": "number",
"format": "double"
},
"accuracyMeters": {
"type": "number",
"format": "double",
"nullable": true
},
"speedKph": {
"type": "number",
"format": "double",
"nullable": true
},
"headingDegree": {
"type": "number",
"format": "double",
"nullable": true
},
"source": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TeamTrackingSource"
          },
          "capturedAtUtc": {
            "type": "string",
            "format": "date-time"
          },
          "rescueBatchId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "rescueOperationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "note": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Team.DTOs.Request.UpdateTeamRequest": {
        "required": [
          "name"
        ],
        "type": "object",
        "properties": {
          "name": {
            "maxLength": 150,
            "minLength": 1,
            "type": "string"
          },
          "description": {
            "maxLength": 1000,
            "type": "string",
            "nullable": true
          },
          "contactPhone": {
            "maxLength": 20,
            "type": "string",
            "nullable": true
          },
          "status": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TeamStatus"
},
"teamType": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TeamType"
          },
          "leaderId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.TeamJoinRequest.DTOs.Request.CreateTeamJoinRequest": {
        "type": "object",
        "properties": {
          "teamId": {
            "type": "string",
            "format": "uuid"
          },
          "reason": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.TeamJoinRequest.DTOs.Request.ReviewTeamJoinRequest": {
        "type": "object",
        "properties": {
          "reviewNote": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.User.BanUserRequest": {
        "required": [
          "reason"
        ],
        "type": "object",
        "properties": {
          "reason": {
            "maxLength": 500,
            "minLength": 1,
            "type": "string"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.User.CreateManagerAccountRequest": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "nullable": true
          },
          "userName": {
            "type": "string",
            "nullable": true
          },
          "password": {
            "type": "string",
            "nullable": true
          },
          "phoneNumber": {
            "type": "string",
            "nullable": true
          },
          "fullName": {
            "type": "string",
            "nullable": true
          },
          "notes": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.User.CreateModeratorAccountRequest": {
        "type": "object",
        "properties": {
          "email": {
            "type": "string",
            "nullable": true
          },
          "userName": {
            "type": "string",
            "nullable": true
          },
          "password": {
            "type": "string",
            "nullable": true
          },
          "phoneNumber": {
            "type": "string",
            "nullable": true
          },
          "fullName": {
            "type": "string",
            "nullable": true
          },
          "reliefStationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "isStationHead": {
            "type": "boolean"
          },
          "notes": {
            "type": "string",
            "nullable": true
          },
          "status": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.ModeratorStatus"
},
"statusReason": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.User.SoftDeletePrivilegedAccountRequest": {
"type": "object",
"properties": {
"reason": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.User.UnbanUserRequest": {
"type": "object",
"properties": {
"note": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.User.UpdateManagerAccountRequest": {
"type": "object",
"properties": {
"email": {
"type": "string",
"nullable": true
},
"userName": {
"type": "string",
"nullable": true
},
"phoneNumber": {
"type": "string",
"nullable": true
},
"fullName": {
"type": "string",
"nullable": true
},
"notes": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.User.UpdateModeratorAccountRequest": {
"type": "object",
"properties": {
"email": {
"type": "string",
"nullable": true
},
"userName": {
"type": "string",
"nullable": true
},
"phoneNumber": {
"type": "string",
"nullable": true
},
"fullName": {
"type": "string",
"nullable": true
},
"reliefStationId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"clearReliefStation": {
"type": "boolean"
},
"isStationHead": {
"type": "boolean",
"nullable": true
},
"notes": {
"type": "string",
"nullable": true
},
"status": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.ModeratorStatus"
          },
          "statusReason": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Vehicle.DTOs.Request.CreateVehicleRequest": {
        "required": [
          "licensePlate",
          "vehicleTypeId"
        ],
        "type": "object",
        "properties": {
          "vehicleTypeId": {
            "type": "string",
            "format": "uuid"
          },
          "licensePlate": {
            "maxLength": 20,
            "minLength": 0,
            "type": "string"
          },
          "reliefStationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "teamId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Vehicle.DTOs.Request.UpdateVehicleRequest": {
        "required": [
          "licensePlate",
          "vehicleTypeId"
        ],
        "type": "object",
        "properties": {
          "vehicleTypeId": {
            "type": "string",
            "format": "uuid"
          },
          "licensePlate": {
            "maxLength": 20,
            "minLength": 0,
            "type": "string"
          },
          "teamId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "status": {
            "maximum": 2,
            "minimum": 1,
            "type": "integer",
            "format": "int32"
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.Vehicle.DTOs.Response.VehicleResponse": {
        "type": "object",
        "properties": {
          "vehicleId": {
            "type": "string",
            "format": "uuid"
          },
          "vehicleTypeId": {
            "type": "string",
            "format": "uuid"
          },
          "vehicleTypeName": {
            "type": "string",
            "nullable": true
          },
          "licensePlate": {
            "type": "string",
            "nullable": true
          },
          "createdBy": {
            "type": "string",
            "format": "uuid"
          },
          "creatorName": {
            "type": "string",
            "nullable": true
          },
          "reliefStationId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "reliefStationName": {
            "type": "string",
            "nullable": true
          },
          "teamId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "teamName": {
            "type": "string",
            "nullable": true
          },
          "status": {
            "type": "integer",
            "format": "int32"
          },
          "statusName": {
            "type": "string",
            "nullable": true
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.VehicleType.DTOs.Request.CreateVehicleTypeRequest": {
        "required": [
          "defaultCapacity",
          "typeName"
        ],
        "type": "object",
        "properties": {
          "typeName": {
            "maxLength": 100,
            "minLength": 0,
            "type": "string"
          },
          "defaultCapacity": {
            "type": "integer",
            "format": "int32"
          },
          "description": {
            "maxLength": 500,
            "minLength": 0,
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.VehicleType.DTOs.Request.UpdateVehicleTypeRequest": {
        "required": [
          "defaultCapacity",
          "typeName"
        ],
        "type": "object",
        "properties": {
          "typeName": {
            "maxLength": 100,
            "minLength": 0,
            "type": "string"
          },
          "defaultCapacity": {
            "type": "integer",
            "format": "int32"
          },
          "description": {
            "maxLength": 500,
            "minLength": 0,
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.VehicleType.DTOs.Response.VehicleTypeResponse": {
        "type": "object",
        "properties": {
          "vehicleTypeId": {
            "type": "string",
            "format": "uuid"
          },
          "typeName": {
            "type": "string",
            "nullable": true
          },
          "defaultCapacity": {
            "type": "integer",
            "format": "int32"
          },
          "description": {
            "type": "string",
            "nullable": true
          },
          "createdAt": {
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.VolunteerRequest.Request.AddVolunteerRequest": {
        "type": "object",
        "properties": {
          "skillIds": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.VolunteerRequest.Request.CreateVolunteerCertificateRequest": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "nullable": true
          },
          "issuedBy": {
            "type": "string",
            "nullable": true
          },
          "issuedDate": {
            "type": "string",
            "format": "date",
            "nullable": true
          },
          "expiryDate": {
            "type": "string",
            "format": "date",
            "nullable": true
          },
          "fileUrl": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.VolunteerRequest.Request.CreateVolunteerRequest": {
        "type": "object",
        "properties": {
          "campaignId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "skillIds": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "nullable": true
          },
          "descriptions": {
            "type": "string",
            "nullable": true
          },
          "yearsOfExperience": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "preferredTeamRole": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TeamRolePreference"
},
"certificates": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.CreateVolunteerCertificateRequest"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.VolunteerRequest.Request.RemoveVolunteerSkillRequest": {
        "type": "object",
        "properties": {
          "skillIds": {
            "type": "array",
            "items": {
              "type": "string",
              "format": "uuid"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.VolunteerRequest.Request.ResubmitVolunteerRequest": {
        "type": "object",
        "properties": {
          "campaignId": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "descriptions": {
            "type": "string",
            "nullable": true
          },
          "yearsOfExperience": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "preferredTeamRole": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TeamRolePreference"
},
"skillIds": {
"type": "array",
"items": {
"type": "string",
"format": "uuid"
},
"nullable": true
},
"certificates": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Request.CreateVolunteerCertificateRequest"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerApplicationReviewResponse": {
        "type": "object",
        "properties": {
          "volunteerProfileId": {
            "type": "string",
            "format": "uuid"
          },
          "userId": {
            "type": "string",
            "format": "uuid"
          },
          "fullName": {
            "type": "string",
            "nullable": true
          },
          "email": {
            "type": "string",
            "nullable": true
          },
          "phoneNumber": {
            "type": "string",
            "nullable": true
          },
          "address": {
            "type": "string",
            "nullable": true
          },
          "dateOfBirth": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "gender": {
            "type": "string",
            "nullable": true
          },
          "appliedAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "verificationStatus": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.VerificationStatus"
},
"status": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.VolunteerStatus"
          },
          "verifiedBy": {
            "type": "string",
            "format": "uuid",
            "nullable": true
          },
          "verifiedAt": {
            "type": "string",
            "format": "date-time",
            "nullable": true
          },
          "reason": {
            "type": "string",
            "nullable": true
          },
          "descriptions": {
            "type": "string",
            "nullable": true
          },
          "yearsOfExperience": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "preferredTeamRole": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TeamRolePreference"
},
"volunteerType": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.VolunteerType"
          },
          "skills": {
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerSkillResponse"
},
"nullable": true
},
"certificates": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerCertificateResponse"
            },
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerCertificateResponse": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "nullable": true
          },
          "issuedBy": {
            "type": "string",
            "nullable": true
          },
          "issuedDate": {
            "type": "string",
            "format": "date",
            "nullable": true
          },
          "expiryDate": {
            "type": "string",
            "format": "date",
            "nullable": true
          },
          "fileUrl": {
            "type": "string",
            "nullable": true
          }
        },
        "additionalProperties": false
      },
      "ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerProfileResponse": {
        "type": "object",
        "properties": {
          "volunteerProfileId": {
            "type": "string",
            "format": "uuid"
          },
          "userId": {
            "type": "string",
            "format": "uuid"
          },
          "fullName": {
            "type": "string",
            "nullable": true
          },
          "email": {
            "type": "string",
            "nullable": true
          },
          "phoneNumber": {
            "type": "string",
            "nullable": true
          },
          "descriptions": {
            "type": "string",
            "nullable": true
          },
          "verificationStatus": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.VerificationStatus"
},
"reason": {
"type": "string",
"nullable": true
},
"campaignId": {
"type": "string",
"format": "uuid",
"nullable": true
},
"campaignName": {
"type": "string",
"nullable": true
},
"campaignRegistrationStatus": {
"$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.CampaignVolunteerRegistrationStatus"
          },
          "yearsOfExperience": {
            "type": "integer",
            "format": "int32",
            "nullable": true
          },
          "preferredTeamRole": {
            "$ref": "#/components/schemas/ReliefManagementSystem.Domain.Enum.TeamRolePreference"
},
"skills": {
"type": "array",
"items": {
"type": "string",
"format": "uuid"
},
"nullable": true
},
"certificates": {
"type": "array",
"items": {
"$ref": "#/components/schemas/ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerCertificateResponse"
},
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Application.Features.VolunteerRequest.Response.VolunteerSkillResponse": {
"type": "object",
"properties": {
"skillId": {
"type": "string",
"format": "uuid"
},
"code": {
"type": "string",
"nullable": true
},
"name": {
"type": "string",
"nullable": true
},
"description": {
"type": "string",
"nullable": true
}
},
"additionalProperties": false
},
"ReliefManagementSystem.Domain.Enum.CampaignCompletionRule": {
"enum": [
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.CampaignResourceType": {
"enum": [
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.CampaignStatus": {
"enum": [
0,
1,
2,
3,
4,
5,
6,
7,
8
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.CampaignTeamRole": {
"enum": [
0,
1,
2,
3,
4
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.CampaignTeamStatus": {
"enum": [
0,
1,
2,
3,
4,
5
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.CampaignType": {
"enum": [
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.CampaignVolunteerRegistrationStatus": {
"enum": [
0,
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.DeliveryMode": {
"enum": [
0,
1
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.DisasterType": {
"enum": [
0,
1,
2,
3,
4,
5
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.DonationStatus": {
"enum": [
0,
1,
2,
3,
4,
5
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.EntityStatus": {
"enum": [
0,
1,
2
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.HouseholdFulfillmentStatus": {
"enum": [
0,
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.InventoryLevel": {
"enum": [
1,
2
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.ModeratorStatus": {
"enum": [
1,
2,
3,
4
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.ReliefStationLevel": {
"enum": [
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.ReliefTeamAssignmentStatus": {
"enum": [
0,
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.RequestVerificationStatus": {
"enum": [
0,
1,
2
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.RescueBatchItemStatus": {
"enum": [
0,
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.RescueBatchStatus": {
"enum": [
0,
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.RescueOperationStatus": {
"enum": [
0,
1,
2,
3,
4,
5,
6,
7
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.RescuePriorityLevel": {
"enum": [
0,
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.RescueRequestType": {
"enum": [
0,
1
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.SupplyAllocationStatus": {
"enum": [
0,
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.SupplyCategory": {
"enum": [
1,
2,
3,
4,
99
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.SupplyShortageRequestStatus": {
"enum": [
0,
1,
2,
3,
4
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.SupplyTransferDocumentType": {
"enum": [
1,
2
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.SupplyTransferStatus": {
"enum": [
1,
2,
3,
4,
5
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.TeamRolePreference": {
"enum": [
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.TeamStatus": {
"enum": [
0,
1,
2,
3,
4
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.TeamTrackingSource": {
"enum": [
1,
2,
3,
4
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.TeamType": {
"enum": [
1,
2
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.TransactionReason": {
"enum": [
1,
2,
3,
4,
5,
6,
7,
8
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.TransactionType": {
"enum": [
1,
2
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.VerificationMethod": {
"enum": [
0,
1,
2,
3,
4,
5
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.VerificationStatus": {
"enum": [
1,
2,
3
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.VolunteerStatus": {
"enum": [
1,
2
],
"type": "integer",
"format": "int32"
},
"ReliefManagementSystem.Domain.Enum.VolunteerType": {
"enum": [
1,
2
],
"type": "integer",
"format": "int32"
}
},
"securitySchemes": {
"Bearer": {
"type": "http",
"description": "Nhập: Bearer {JWT token}",
"scheme": "bearer",
"bearerFormat": "JWT"
}
}
},
"security": [
{
"Bearer": [ ]
}
]
}
