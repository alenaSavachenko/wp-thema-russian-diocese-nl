<?php

//debug

@ini_set('error_reporting', E_ALL);
@ini_set('display_errors', 1);
@ini_set('display_startup_errors', 1);

//Begin Really Simple SSL session cookie settings
@ini_set('session.cookie_httponly', true);
@ini_set('session.cookie_secure', true);
@ini_set('session.use_only_cookies', true);
//END Really Simple SSL
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'russian_diocese_nl' );

/** MySQL database username */
define( 'DB_USER', 'russian_diocese_nl' );

/** MySQL database password */
define( 'DB_PASSWORD', 'o3yRfVYorLnzMTMUx8g47AN7' );

/** MySQL hostname */
define( 'DB_HOST', 'russian-diocese.nl.mysql' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'kIE8<+J55Fx=,b^c-S5RMO)2b=tyOA[;?uaPU76g*q1s/JLKV(=M`UpoJ^K#VqHb' );
define( 'SECURE_AUTH_KEY',  'Z!R%ikby&<6v/[)[#-i&d2s|r_cr.FwHwQYyi]bp,_a3?Q9+F#;{p1@V)Tw4PqYG' );
define( 'LOGGED_IN_KEY',    'ExzOb3S08X2Ou{8kGbe{;%~GBKfZ]QMusd`S*9}^BoZOuf0X)M`#+XKD#5L6Sva2' );
define( 'NONCE_KEY',        '.CwhbH<lF5Q)RACMLHP[;*}v,QM[^wiY%;I9=Z)HHspRTtn_ZPjxcKK^}}*CFfc~' );
define( 'AUTH_SALT',        'i2o?e|`|j;m%-VV)-  [dc(kP~V8zy//wX{9,HOcag+vql8O=Q>yvh2 .L>M#.$I' );
define( 'SECURE_AUTH_SALT', 'I>nC&)S{`NFaM2nSy7Aor4XUYdeuuSj:-EgS6kfti&T!#Ly}:zmQmE>NG[RteVPY' );
define( 'LOGGED_IN_SALT',   'UvcpO]>zXo]eYV0YhyltE*+K:4Cq{MqKOQwQ&2@+oc^)c +>:%Y(3_?7I][C@$EU' );
define( 'NONCE_SALT',       'I{11a[.+LMu8[ix ]a[!P9TH(?Jw8{bi&+R)#(:mZlXK{4G5fs#?D7{OE! vX}x;' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'version_2021_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */


/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';


define( 'WP_DEBUG', true );
define('WP_DEBUG_DISPLAY', true);
define('WP_DEBUG_LOG', true);
define( 'WP_ENVIRONMENT_TYPE', 'development' );
define( 'WP_DEBUG_LOG', '/wp-content/errors.log' );
define( 'SCRIPT_DEBUG', true );
