-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 12-03-2021 a las 09:36:58
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `regalias`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `regalias`
--

INSERT INTO `regalias` (`id`, `cancion_id`, `plataforma`, `clics`, `ingresos`, `anio`, `mes`, `pais`) VALUES
(1, 'MXF602000187', 'Spotify', 1, 0.00189099996350706, '2021', '1', 'Ecuador'),
(2, 'MXF602000187', 'Spotify', 1, 0.00336400000378489, '2021', '1', 'Germany'),
(3, 'MXF602000187', 'Spotify', 26, 0.0309669994749129, '2021', '1', 'Mexico'),
(4, 'MXF602000187', 'Spotify', 1, 0.00336400000378489, '2021', '1', 'USA'),
(5, 'MXF602000187', 'Spotify', 1, 0.0030670000705868, '2020', '12', 'USA'),
(6, 'MXF602000187', 'Spotify', 16, 0.021219999762252, '2020', '12', 'Mexico'),
(7, 'MXF602000187', 'Spotify', 16, 0.021219999762252, '2020', '12', 'Mexico'),
(8, 'MXF602000187', 'Spotify', 25, 0.0243510000873357, '2020', '11', 'Mexico'),
(9, 'MXF602000187', 'Spotify', 1, 0.00402700016275048, '2020', '11', 'Netherlands'),
(10, 'MXF602000187', 'Spotify', 1, 0.00235700001940131, '2020', '11', 'Slovakia'),
(11, 'MXF602000187', 'Spotify', 2, 0.00771000003442168, '2020', '11', 'USA'),
(12, 'MXF602000187', 'Spotify', 40, 0.0383160003693774, '2020', '10', 'Mexico'),
(13, 'MXF602000187', 'Spotify', 1, 0.0029269999358803, '2020', '8', 'Germany'),
(14, 'MXF602000187', 'Spotify', 27, 0.0249810004606843, '2020', '8', 'Mexico'),
(15, 'MXF602000187', 'Spotify', 7, 0.0258319992572069, '2020', '11', 'USA'),
(16, 'MXF602000187', 'Spotify', 18, 0.01800500031095, '2020', '8', 'Mexico'),
(17, 'MXF600600224', 'Spotify', 4, 0.0018690000142669305, '2021', '1', 'Argentina'),
(18, 'MXF600600224', 'Spotify', 4, 0.0018690000142669305, '2021', '1', 'Argentina'),
(19, 'MXF600600224', 'Spotify', 1, 0.0035929998848587275, '2021', '1', 'Austria'),
(20, 'MXF600600224', 'Spotify', 1, 0.001643999945372343, '2021', '1', 'Brazil'),
(21, 'MXF600600224', 'Spotify', 1, 0.002807999961078167, '2021', '1', 'Canada'),
(22, 'MXF600600224', 'Spotify', 10, 0.011070000240579247, '2021', '1', 'Chile'),
(23, 'MXF600600224', 'Spotify', 3, 0.003407000098377466, '2021', '1', 'Colombia'),
(24, 'MXF600600224', 'Spotify', 6, 0.011185999697772786, '2021', '1', 'Costa Rica'),
(25, 'MXF600600224', 'Spotify', 36, 0.13101900345645845, '2021', '1', 'France'),
(26, 'MXF600600224', 'Spotify', 1, 0.003364000003784895, '2021', '1', 'Germany'),
(27, 'MXF600600224', 'Spotify', 3, 0.0034650000743567944, '2021', '1', 'India');

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `regalias`
--
ALTER TABLE `regalias`
  ADD CONSTRAINT `fk_REGALIAS_CANCION` FOREIGN KEY (`cancion_id`) REFERENCES `cancion` (`ISRC`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
