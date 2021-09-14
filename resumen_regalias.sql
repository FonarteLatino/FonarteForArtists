-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-09-2021 a las 17:07:11
-- Versión del servidor: 10.4.21-MariaDB
-- Versión de PHP: 8.0.10

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

DROP TABLE IF EXISTS `artista`;
CREATE TABLE IF NOT EXISTS `artista` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sello_id` int(11) DEFAULT NULL,
  `nombre` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ARTISTA_SELLO` (`sello_id`)
) ENGINE=InnoDB AUTO_INCREMENT=578 DEFAULT CHARSET=utf8;

--
-- RELACIONES PARA LA TABLA `artista`:
--   `sello_id`
--       `sello` -> `id`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cancion`
--

DROP TABLE IF EXISTS `cancion`;
CREATE TABLE IF NOT EXISTS `cancion` (
  `ISRC` varchar(500) NOT NULL,
  `disco_UPC` bigint(100) NOT NULL,
  `nombre` varchar(500) NOT NULL,
  PRIMARY KEY (`ISRC`,`disco_UPC`),
  KEY `fk_CANCION_DISCO` (`disco_UPC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- RELACIONES PARA LA TABLA `cancion`:
--   `disco_UPC`
--       `disco` -> `UPC`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disco`
--

DROP TABLE IF EXISTS `disco`;
CREATE TABLE IF NOT EXISTS `disco` (
  `UPC` bigint(100) NOT NULL,
  `artista_id` int(11) NOT NULL,
  `nombre` varchar(500) NOT NULL,
  PRIMARY KEY (`UPC`),
  KEY `fk_DISCO_ARTISTA` (`artista_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- RELACIONES PARA LA TABLA `disco`:
--   `artista_id`
--       `artista` -> `id`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `regalias`
--

DROP TABLE IF EXISTS `regalias`;
CREATE TABLE IF NOT EXISTS `regalias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cancion_id` varchar(500) NOT NULL,
  `plataforma` varchar(500) NOT NULL,
  `clics` int(100) NOT NULL,
  `ingresos` double NOT NULL,
  `anio` varchar(500) NOT NULL,
  `mes` varchar(500) NOT NULL,
  `pais` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_REGALIAS_CANCION` (`cancion_id`)
) ENGINE=InnoDB AUTO_INCREMENT=513713 DEFAULT CHARSET=utf8;

--
-- RELACIONES PARA LA TABLA `regalias`:
--   `cancion_id`
--       `cancion` -> `ISRC`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sello`
--

DROP TABLE IF EXISTS `sello`;
CREATE TABLE IF NOT EXISTS `sello` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(500) NOT NULL,
  `rol` tinyint(1) NOT NULL,
  `usr` varchar(500) DEFAULT NULL,
  `psw` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

--
-- RELACIONES PARA LA TABLA `sello`:
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sello_artista`
--



--
-- RELACIONES PARA LA TABLA `sello_artista`:
--   `id_artista`
--       `artista` -> `id`
--   `id_sello`
--       `sello` -> `id`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sello_disco`
--

DROP TABLE IF EXISTS `sello_disco`;
CREATE TABLE IF NOT EXISTS `sello_disco` (
  `id_sello` int(11) NOT NULL,
  `disco_UPC` bigint(100) NOT NULL,
  PRIMARY KEY (`id_sello`,`disco_UPC`),
  KEY `fk_SELLO-DISCO_SELLO` (`id_sello`),
  KEY `fk_SELLO-DISCO_DISCO` (`disco_UPC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- RELACIONES PARA LA TABLA `sello_disco`:
--

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

--
-- Filtros para la tabla `sello_artista`
--

ALTER TABLE `sello_disco`
  ADD CONSTRAINT `fk_SELLO-DISCO_DISCO` FOREIGN KEY (`disco_UPC`) REFERENCES `disco` (`UPC`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_SELLO-DISCO_SELLO` FOREIGN KEY (`id_sello`) REFERENCES `sello` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
