-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-02-2021 a las 07:58:29
-- Versión del servidor: 10.4.13-MariaDB
-- Versión de PHP: 7.2.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `resumen_regalias`
--
CREATE DATABASE IF NOT EXISTS `resumen_regalias` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `resumen_regalias`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `artista`
--

CREATE TABLE `artista` (
  `id` int(11) NOT NULL,
  `sello_id` int(11) DEFAULT NULL,
  `nombre` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cancion`
--

CREATE TABLE `cancion` (
  `ISRC` varchar(500) NOT NULL,
  `disco_UPC` bigint(100) NOT NULL,
  `nombre` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disco`
--

CREATE TABLE `disco` (
  `UPC` bigint(100) NOT NULL,
  `artista_id` int(11) NOT NULL,
  `nombre` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `regalias`
--

CREATE TABLE `regalias` (
  `id` int(11) NOT NULL,
  `cancion_id` varchar(500) NOT NULL,
  `plataforma` varchar(500) NOT NULL,
  `fecha` varchar(500) NOT NULL,
  `clics` int(100) NOT NULL,
  `ingresos` int(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sello`
--

CREATE TABLE `sello` (
  `id` int(11) NOT NULL,
  `nombre` varchar(500) NOT NULL,
  `rol` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `artista`
--
ALTER TABLE `artista`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ARTISTA_SELLO` (`sello_id`);

--
-- Indices de la tabla `cancion`
--
ALTER TABLE `cancion`
  ADD PRIMARY KEY (`ISRC`,`disco_UPC`),
  ADD KEY `fk_CANCION_DISCO` (`disco_UPC`);

--
-- Indices de la tabla `disco`
--
ALTER TABLE `disco`
  ADD PRIMARY KEY (`UPC`),
  ADD KEY `fk_DISCO_ARTISTA` (`artista_id`);

--
-- Indices de la tabla `regalias`
--
ALTER TABLE `regalias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_REGALIAS_CANCION` (`cancion_id`);

--
-- Indices de la tabla `sello`
--
ALTER TABLE `sello`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `artista`
--
ALTER TABLE `artista`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `regalias`
--
ALTER TABLE `regalias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sello`
--
ALTER TABLE `sello`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `artista`
--
ALTER TABLE `artista`
  ADD CONSTRAINT `fk_ARTISTA_SELLO` FOREIGN KEY (`sello_id`) REFERENCES `sello` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

--
-- Filtros para la tabla `cancion`
--
ALTER TABLE `cancion`
  ADD CONSTRAINT `fk_CANCION_DISCO` FOREIGN KEY (`disco_UPC`) REFERENCES `disco` (`UPC`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Filtros para la tabla `disco`
--
ALTER TABLE `disco`
  ADD CONSTRAINT `fk_DISCO_ARTISTA` FOREIGN KEY (`artista_id`) REFERENCES `artista` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Filtros para la tabla `regalias`
--
ALTER TABLE `regalias`
  ADD CONSTRAINT `fk_REGALIAS_CANCION` FOREIGN KEY (`cancion_id`) REFERENCES `cancion` (`ISRC`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
