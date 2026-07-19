/** 静的アセットを配信し、HTML 内の OG メタの絶対 URL を配信時に埋める Worker。 */

/** scripts/prerender.ts が HTML に埋める */
const PLACEHOLDER = "%SITE_URL%"

interface Env {
  ASSETS: Fetcher
}

class SiteUrlRewriter {
  private readonly attribute: string
  private readonly origin: string

  constructor(attribute: string, origin: string) {
    this.attribute = attribute
    this.origin = origin
  }

  element(element: Element): void {
    const value = element.getAttribute(this.attribute)
    if (value !== null && value.startsWith(PLACEHOLDER)) {
      element.setAttribute(this.attribute, this.origin + value.slice(PLACEHOLDER.length))
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request)

    if (!response.headers.get("content-type")?.includes("text/html")) {
      return response
    }

    const { origin } = new URL(request.url)
    return new HTMLRewriter()
      .on("meta", new SiteUrlRewriter("content", origin))
      .on("link", new SiteUrlRewriter("href", origin))
      .transform(response)
  },
}
