FROM php:8.2-cli

# Set working directory
WORKDIR /var/www/html

# Copy composer.json dan composer.lock dulu (biar cache efisien)
COPY composer.json composer.lock ./

# Install dependencies dan composer
RUN apt-get update && apt-get install -y \
    libpq-dev unzip \
    && docker-php-ext-install pdo pdo_pgsql \
    && php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && composer install --no-interaction --no-dev --prefer-dist \
    && rm composer-setup.php

# Copy seluruh file project (termasuk app/, routes/, dll)
COPY . .

# Expose port
EXPOSE 3002

# Jalankan server lumen
CMD ["php", "-S", "0.0.0.0:3002", "-t", "public"]
