---
page_type: sample
languages:
- .net
- node.js
products:
- azure media services
- azure active directory
description: "Player app (Single-Page App) covering OAuth 2 flow and protected video playback"
urlFragment: "media-services-content-protection-azure-ad"
---

# OAuth2 Test Tool/Player App for Content Protection with Azure AD v2

This sample includes the following:

- Authentication and authorization via OAuth 2 Authorization Code Flow with PKCE (against Azure AD v2 endpoints);
- Playback of DRM or AES protected video assets in AMS v3.

## Contents

Outline the file contents of the repository. It helps users navigate the codebase, build configuration and any related assets.

| File/folder       | Description                                |
|-------------------|--------------------------------------------|
| `npmweb`          | Sample source code.                        |
| `.gitignore`      |       |
| `CHANGELOG.md`    | List of changes to the sample.             |
| `CONTRIBUTING.md` | Guidelines for contributing to the sample. |
| `README.md`       | This README file.                          |
| `LICENSE`         | The license for the sample.                |

## Prerequisites

1. An Azure subscription
1. Visual Studio Code
1. Node.js

Since the client app is a Single Page App (SPA), it could be dev platform agnostic. You could use another web dev platform you prefer, for which some details are provided in the doc (Set Up the Player App section)

## Setup

The setup has the following three parts:

1. Set up in an Azure AD tenant
1. Set up in an media service account
1. Set up this sample app

Each of the above three steps has been detailed in the corresponding section of the [Tutorial: End-to-End Content Protection using Azure AD](https://docs.microsoft.com/azure/media-services/latest/aad-ams-content-protection).

## Running the sample

1. Sign in with an account in the AAD tenant you use. If successful, you should see the display of `access_token`, `id_token` and `refresh_token`. You can renew the current `access_token` by clicking on **acquire/renew access_token**.
1. Click on the **AMS** link in the right vertical menu.
1. Based on the browser you use, choose the correct combination of Encryption vs Streaming Protocol vs Container Format. For example, on Chrome, you could choose any items with Widevine or AES encryption.
1. If you would like to enable the RBAC for License Delivery via AAD Group Membership check scenario via group membership (some users can watch a content while others cannot), please follow the steps detailed in the Role-Based Access Control for License Delivery via AAD Group Membership section of the companion document [Tutorial: End-to-End Content Protection using Azure AD](https://docs.microsoft.com/azure/media-services/latest/aad-ams-content-protection).

## Key concepts

Some basic understanding of the following topics would be very helpful in understanding and following this doc to set up the end-to-end system, but are optional:

1. Modern cloud authentication (OpenID Connect) and authorization (OAuth 2.0);
1. Authorization Code Flow in OAuth 2.0 and why PKCE is needed;
1. Delegated Permission vs Application Permission;
1. Azure AD v2 endpoints (officially called Microsoft Identity Platform);
1. @azure/msal-browser v2.0, one of the members in Microsoft Authentication Library (MSAL) SDK family for different client platforms;
1. JWT token, its claims and signing key rollover.

In fact this sample is a generic OAuth2 test tool for testing a REST API secured by OAuth 2. Besides content protection, you can test Microsoft Graph API or any custom REST API.

## FAQ

**Q: How can I confirm that the JWT token issued by the AAD tenant is indeed v2 instead of v1?**

**A:** After sign in, click on the **Parse** link next to the `access_token` or `id_token`. You should see the token content below the containing “ver”:

**Q: While this document/sample uses AAD v2 endpoints (Microsoft Identity Platform), my customer is currently using AAD v1 endpoints in production and uses AAD v1 endpoints for their media solution. Are AAD v1 endpoints supported by this sample?**

**A:** Yes. The only difference is the audience claim value in JWT issued by v1 endpoints is slightly different from those issued by v2 endpoints. All you need to do is to adjust the value accordingly in the audience inside `ContentKeyPolicyRestriction`. You can easily see the audience claim value (aud) by parsing such a v1 JWT token using a token parser such as `http://aka.ms/jwt`. To switch to a v1 JWT token, you should set the value of the attribute `accessTokenAcceptedVersion` to null in the manifest of the `LicenseDeliveryResource2` app.

**Q: Can I host the player app anywhere I choose, instead of being limited to the subscription attached to the AAD tenant I use?**

**A:** You can host the player app anywhere, on your client machine (as you test locally), in any Azure subscription, any hosting environment (Web App, container, VM or AKS).

**Q: Suppose my customer has a media service account set up in their subscription and tenant. May I set up such a system in my tenant (such as a Microsoft tenant) but use the customer's media service account in customer's subscription and tenant?**

**A:** Yes, the media service account, the player app, and the user tenant do not have to be in the same tenant and Azure subscription. In fact, they can each be in a separate tenant. For example, the media service account can be in a customer subscription, player app can be in another subscription (such as a partner), and the user tenant can be in a Microsoft tenant. In other words, a customer with a guest `outlook.com` account can sign in via `outlook.com`, get a token from the Microsoft tenant, get license from the media service in the customer subscription, and through the player app hosted in another subscription/tenant.

**Q: Why is SPA chosen as the type of the player app?**

**A:** We have chosen SPA for this sample because SPA is platform-agnostic and because SPA is subject to all of the following three constraints:

1. It is a public client hence cannot hide any secret such as client_secret. A web app can hide secret on the server hence is not subject to this constraint.
1. It is subject to browser security sandbox such as CORS/preflight restriction. A mobile application or desktop application is not subject to this constraint.
1. It is subject to modern javascript security constraint such as fetch with authorization will make custom headers not accessible by default. A mobile or desktop app is not subject to this constraint.

**Q: While this sample uses SPA (public client), may I replace it by a web application (confidential client)?**

**A:** Yes, you can replace it with a web application on any platform (`ASP.NET` Core, Node.js, Python, etc.). You can just use Authorization Code Flow. PKCE would no longer necessary (but is still recommended). You may choose to use a MSAL SDK for the development platform you use.

**Q: Is there a sample of web application instead of SPA, using AAD v1 instead of v2 endpoints?**

**A:** Yes, this sample, [AMS Test](http://aka.ms/amtest) is a web app on `ASP.NET` using AAD v1 endpoints. It has feature parity with the sample in this doc. The sample in this doc uses the latest stack and PKCE spec so that it does not need `client_secret`.

**Q: My customer does not use Azure AD for the media solution. Is there a sample for custom Secure Token Service (STS) to issue JWT token?**

**A:** Yes, there is a custom STS sample developed in .NET Core which follows OAuth 2.0 spec and supports Key Rollover just like Azure AD does. If interested, you may request the custom STS sample through your Microsoft contact.

**Q: Does this sample support protected UHD/HEVC (4K) content?**

**A:** Yes, you may test protected HEVC content in a browser supporting HEVC: MS Edge for PlayReady+DASH+CSF or PlayReady+DASH+CMAF, or Safari for FairPlay+HLS+CMAF.

**Q: Which browsers are supported by this sample?**

**A:** All major browsers of recent versions: MS Edge, Chrome, Firefox, Opera, Safari. Different browsers support different DRM through EME, and you can only test the supported DRM in a browser. On Safari, you should use Redirect mode since it does not support popups.

> [!NOTE]
> IE11 on Windows 10 is not supported, for the following two reasons, both can be corrected if needed:
> 1. ES 6 javascript is used in the SPA app and IE11 does not support ES 6;
> 1. IE11 polypill for @azure/msal-browser SDK is not used in the SPA.

**Q: Does it make any difference to this sample if the AMS streaming endpoint has CDN enabled or disabled?**

**A:** No.

**Q: How long is a JWT token valid? Can I change it?**

**A:** The default valid duration of an access token issued by AAD is 1 hour (plus 5 minutes). More info and possible customization can be found in this doc: [Configurable token lifetimes in Azure Active Directory](https://docs.microsoft.com/azure/active-directory/develop/active-directory-configurable-token-lifetimes). The sample provides a UI which allows you to renew the current `access_token` using the `refresh_token`. After sign in, you can play the video with the new `access_token`. After more than an hour, you should no longer be able to play the video due to expired `access_token`. Click **acquire/renew access_token** link. You should be able to play the video again.

**Q: There is no mention of the DRM configuration details such as persistent vs non-persistent license, Widevine security level, PlayReady security level, output protection settings, or various durations of validity, etc. Why is that?**

**A:** This document/sample focuses only on a subset of content protection; How to protect license delivery service, or how the license delivery service is secured and to access it securely. This part is orthogonal to the content of a DRM license, which is a separate topic and has been addressed by the documents of each DRM vendor. See: [Media services content protection overview](https://docs.microsoft.com/azure/media-services/previous/media-services-content-protection-overview)

**Q: Why is the sample player app called OAuth2 Test Tool (aka.ms/ott), instead of something like DRM Test Tool?**

**A:** For modern apps, the most popular API type is REST and the most popular way to secure a REST API is OAuth 2.0. This sample player is actually a generic test tool for any REST API secured by OAuth 2 as long as it allows Authorization Code Flow. In addition, as an SPA app type, this test tool does not require or hide any secret such as `client_secret`. This is achieved by using the latest @azure/msal-browser v2.0 which leverages PKCE spec. As you can see on API tab, the tool currently allows you to test three secured REST APIs:

1. A single-tenant custom REST API (secured via API API Management using OAuth 2.0)
1. Microsoft Graph API (multi-tenant)
1. AMS license delivery service API (multi-tenant)