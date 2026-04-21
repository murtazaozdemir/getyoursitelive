# REST Screenshoot 📸

REST Screenshoot is a free tool for capturing screenshots of webpages via a REST API. It provides a simple, easy-to-use endpoint URL for generating screenshots.

## Endpoint URL

To generate a screenshot, make a GET request to the following endpoint URL, replacing `{url}` with the URL of the webpage you want to capture:

`https://rest-screenshoot.fly.dev/screenshot?url={url}`

## Example

To capture a screenshot of the React Table server-side pagination, search, and sort order story on Metaphore, use this URL:

`https://rest-screenshoot.fly.dev/screenshot?url=https://metaphore.vercel.app/stories/javascript/react-table-sever-side-pagination-search-sortorder`

The resulting screenshot will be returned as a PNG image.

## Options

| Query    | Type     | Description                           | Required |
| :------- | :------- | :------------------------------------ | :------- |
| `url`    | `string` | Valid url for target website          | Yes      |
| `width`  | `number` | Valid Number (pixel) default is `850` | No       |
| `height` | `number` | Valid Number (pixel) default is `400` | No       |
| `pick`   | `string` | Valid CSS Selector for element        | No       |

Note: This project idea is an extension for [Metaphor Website](https://metaphore.vercel.app)

## Donation / Support

If you find REST Screenshoot to be a helpful tool for your website or application, please consider supporting the project. Your donation or sponsorship can help ensure that the project continues to thrive and improve over time. You can sponsor the project directly through Github Sponsor or donate through Paypal. Your support is greatly appreciated and will help to ensure that this powerful tool remains available for free to users all over the world. Thank you for your generosity and support!
