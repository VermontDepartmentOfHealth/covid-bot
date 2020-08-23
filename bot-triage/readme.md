# Bot Log Triage

## Structure

* app
* db
* func


## app

* .net core 3.0
* azure ad


## db

* table storage

## func

* azure functions




## Steps

### 1. AD > Register an Application

* Organizational Directory Only
* Redirect URIs

  https://localhost:44321/signin-oidc
  https://localhost:44321/
  http://localhost:5000/signin-oidc

### 1.2 Setup App Manifest

Set [`oauth2AllowImplicitFlow` to `true`](https://stackoverflow.com/a/49131396/1366033)
Set [`oauth2AllowIdTokenImplicitFlow` to `true`](https://stackoverflow.com/a/56899990/1366033)

```json
{
  "oauth2AllowIdTokenImplicitFlow": true,
  "oauth2AllowImplicitFlow": true,
}
```

Add [App Roles](https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-app-manifest#approles-attribute) to Manifest + [Generate new GUIDs](https://www.guidgenerator.com/online-guid-generator.aspx)

```json
"appRoles": [
        {
        "allowedMemberTypes": [
            "User"
        ],
        "displayName": "Admin",
        "id": "***",
        "description": "Admins can control back end functionality",
        "value": "Admin"
    },
    {
        "allowedMemberTypes": [
            "User"
        ],
        "displayName": "User",
        "id": "***",
        "description": "Regular user can just do regular user stuff",
        "value": "User"
    }
],
```

### 2. Create MVC App Project

```bash
dotnet new mvc --auth SingleOrg \
    --client-id *** \
    --tenant-id *** \
    --domain Vermontgov.onmicrosoft.com \
    --framework netcoreapp3.1 \
    --name bot-triage-ui
```

Get `client-id` (application) & `tenant-id` (directory) from Application Registration

### 2.1 Update AppSettings

Create `appsettings.development.json` and move secrets there before commiting
