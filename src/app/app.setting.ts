export class AppSettings {
  static env = 'live'; // live;
  static isProd = AppSettings.env === 'live';
  public static SITE_ENDPOINT = AppSettings.isProd
    ? 'https://photobash.co/'
    : 'http://localhost:4200/';
  public static SUB_SITE_ENDPOINT = AppSettings.isProd
    ? 'https://photobash.co/'
    : 'http://localhost:4200/';
  public static API_ENDPOINT = AppSettings.isProd
    ? 'https://admin.photobash.co/'
    : 'https://admin.photobash.co/';
  public static IMG_ENDPOIT = AppSettings.isProd
    ? 'https://admin.photobash.co/assets/front/img/'
    : 'https://admin.photobash.co/assets/front/img/';
  public static SERVER_IMG_PATH = AppSettings.isProd
    ? 'https://admin.photobash.co/'
    : 'https://admin.photobash.co/';
  public static PHOTOGRAPHER_REDIRECT_URL = AppSettings.isProd
    ? 'https://admin.photobash.co/thephotographer'
    : 'https://admin.photobash.co/thephotographer';
  public static ASSETS_URL = AppSettings.isProd
    ? 'https://admin.photobash.co/assets/'
    : 'https://admin.photobash.co/assets/';
  /* Social Credentials */
  public static GOOGLE_PROVIDER_ID =
    '801023892695-u8nlq3rtr6b1729fdibct3chp3oag8a5.apps.googleusercontent.com';
  public static FB_PROVIDER_ID = '187685235396074';
  public static VAT_VALIDATE_URL =
    'https://www.apilayer.net/api/validate?access_key=10ef45b8872443a7f24790a475017897&vat_number=';

  /* Configuration for data */
  public static IMG_PER_PAGE = 75;
  public static PACKS_PER_PAGE = 75;
  public static TOTAL_IMAGES_TO_SHOW = 500;
  public static TOTAL_MODELS_TO_SHOW = 500;
  public static SITE_PASSWORD = 'SbDXQx8DNkSba6k';
  public static THREE_D_IN_DEV = false;
}
