# Changelog

## [Unreleased]

## [2.19] - 2024-12-05

### Changed

- WG-295: Improve error message when duplicate syncing project (#255)
- Remove temporary banner related to Tapis V3 migration (#287)

## [2.18] - 2024-8-07

### Changed

- WG-366, WG-227: Add support for Tapis V3 (#238, #232, #231, #220, #214, #217, #213)
- WG-268: Add authentification to backend (#244)
- Add DesignSafe project id to project listing (#241)
- WG-288: Improve configuration of DesignSafe url (#245)
- Add temporary banner for Tapis V3 migration (#249)

### Fixed

- WG-287: Fix infinite scroll when listing files and multiple '..' entries (#240)

## [2.17] - 2024-4-29

### Changed

 - WG-212: Use updated project create and project update routes (#199)

### Fixed
 - WG-161: Update devops documentation (#221)

## [2.16] - 2023-12-19

### Added

- WG-96, WG-170: Support RAPID questionnaire file format (#167, #186, #178, #177, #176, #173, #174, #171, #169, #165, #144)
- WG-138, WG-139, WG-140: Improve logs for analytics (#170, #166,  #179, #180)
- WG-91: Allow non-persistent tile layer adjustments in public hazmapper maps (#175)

### Changed

- WG-194: Update Jira links in PR template (#182)

### Fixed

- WG-83: Handle overlapping point clouds (#181)

## [2.15] - 2023-10-13

### Fixed

- WG-143: Added new Google Analytics 4 tracking property (#158)
- Remove duplicate download button (#154)

## [2.14] - 2023-10-03

### Changed

- WG-155: Add dev server as option for backend (#149)

### Fixed

- WG-145: fix spinner error on project listing page (#148)

## [2.13] - 2022-06-05

### Added

- Add link to open map/gallery in Taggit (#135)

### Changed

- Use ubuntu-latest in CI testing (#133)

### Fixed
- WG-79: fix zoom level when selecting assets (#138)
- WG-78: remove asset delete button from public map view (#139)

## 2.12

_No release_

## [2.11] - 2022-03-02

### Added

- DES-2131: Fix linting and testing and add github ci testing. (#95) 

## 2.10

_No release_

## [2.9] - 2022-09-29

### Added

- DES-2334: Add testing linting. (#107)
- DES-2309: Add virtual list rendering. (#104)
- DES-2307: Add basic router. (#103)
- DES-2131: Adjust workflow to use angular folder. (#102)
- DES-1996: Restrict deletion of projects to admins/creators (#101)
- Update makefile (#100)
- React/Angular Hybrid (#97)

### Fixed

- Merge conflict resolution related to DES-2131 (#105)
- Hotfix/Pin chai version (#94)

## [2.8] - 2022-06-03

### Added

- DES-2215: Adjust tile server zoom levels (#89)

### Fixed

- DES-2273: Mapillary authentication token enforce login (#91)

## [2.7] - 2022-04-27

### Added

- DES-1828: Support Streetview with Mapillary (#45)

## [2.6] - 2022-04-19

### Fixed

- DES-2185: Fix filtering (#82)

## [2.5] - 2022-03-07

### Added

- DES-2165: Add spinner to welcome list item on deletion in progress. (#74)
- DES-2183: Add arcgis tile support to hazmapper. (#78)

### Fixed
- Fix systemId rendering bug. (#76)
- DES-2167: Associated project is not shown with map (#75)

## [2.4] - 2022-01-21

### Added

- DES-1988: Save to project metadata. (#70)
- DES-2006: Add ability to display custom styles and icons on map. (#65)

### Changed

- DES-2001: Project links as observables (subscribe to project-user data). (#67)
- DES-2054: Fix point cloud preview. (#69)

## [2.3] - 2021-06-09

### Added

- DES-1929: Add save to file functionality. (#50)
- DES-1936: Make designsafe link dynamic (staging/production). (#63)
- DES-1953: Add drop-down menu and back button. (#55)

### Changed

- DES-1950: Update deployment steps (#54)
- DES-1927: Improve public map (#61)

## [2.2] - 2021-04-28

### Added

- DES-1792: Add public viewer (#38) 
- DES-1760: Add External Tile Servers and QMS search (#39) 
- DES-1676: Add ability to update project information in manage panel
- DES-1845: Add mouse multi-select. (#40) 
- DES-1838: Add UUID routes and splash page. (#42) 
- DES-1713: Support staging client (#44) 
- DES-1900: Add route support (#46) 
- DES-1761: Loader/spinner to notify user that features are being fetched
- DES-1895: Add higher resolution image to welcome page. (#49)

### Changed

- DES-1713: Push images to dockerhub in CI (#41) 
- DES-1946: Use public project routes when accessing public view of map (#53) 

### Fixed

- DES-1713: Fix unit tests and run in CI (#33)
- DES-1906: Fix tileserver issues during project switching (#47) 
- DES-1934: Fix broken routing in staging deployment (#51) 

## [2.1] - 2020-10-05

[unreleased]: https://github.com/TACC-Cloud/hazmapper/compare/v2.17...HEAD
[2.17]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.17
[2.16]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.16
[2.15]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.15
[2.14]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.14
[2.13]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.13
[2.11]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.11
[2.9]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.9
[2.8]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.8
[2.7]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.7
[2.6]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.6
[2.5]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.5
[2.4]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.4
[2.3]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.3
[2.2]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.2
[2.1]: https://github.com/TACC-Cloud/hazmapper/releases/tag/v2.1
