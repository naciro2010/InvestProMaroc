package ma.investpro.service;

import lombok.RequiredArgsConstructor;
import ma.investpro.dto.ConventionDTO;
import ma.investpro.entity.Convention;
import ma.investpro.exception.ResourceNotFoundException;
import ma.investpro.repository.ConventionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConventionService {

    private final ConventionRepository conventionRepository;

    public List<ConventionDTO> getAll() {
        return conventionRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public List<ConventionDTO> getAllActive() {
        return conventionRepository.findByActifTrue().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public List<ConventionDTO> getActiveAtDate(LocalDate date) {
        return conventionRepository.findActiveAtDate(date).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public ConventionDTO getById(Long id) {
        Convention convention = conventionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Convention", "id", id));
        return toDTO(convention);
    }

    public ConventionDTO getByCode(String code) {
        Convention convention = conventionRepository.findByCode(code)
            .orElseThrow(() -> new ResourceNotFoundException("Convention", "code", code));
        return toDTO(convention);
    }

    public List<ConventionDTO> search(String search) {
        return conventionRepository.search(search).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public ConventionDTO create(ConventionDTO dto) {
        if (conventionRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Une convention avec le code " + dto.getCode() + " existe déjà");
        }

        Convention convention = toEntity(dto);
        convention.setActif(true);
        Convention saved = conventionRepository.save(convention);
        return toDTO(saved);
    }

    @Transactional
    public ConventionDTO update(Long id, ConventionDTO dto) {
        Convention convention = conventionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Convention", "id", id));

        // Vérifier si le code est déjà utilisé par une autre convention
        if (!convention.getCode().equals(dto.getCode()) &&
            conventionRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Une convention avec le code " + dto.getCode() + " existe déjà");
        }

        updateEntityFromDTO(convention, dto);
        Convention updated = conventionRepository.save(convention);
        return toDTO(updated);
    }

    @Transactional
    public void delete(Long id) {
        Convention convention = conventionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Convention", "id", id));
        convention.setActif(false);
        conventionRepository.save(convention);
    }

    @Transactional
    public void hardDelete(Long id) {
        if (!conventionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Convention", "id", id);
        }
        conventionRepository.deleteById(id);
    }

    // Mappers
    private ConventionDTO toDTO(Convention entity) {
        return ConventionDTO.builder()
            .id(entity.getId())
            .code(entity.getCode())
            .libelle(entity.getLibelle())
            .tauxCommission(entity.getTauxCommission())
            .baseCalcul(entity.getBaseCalcul())
            .tauxTva(entity.getTauxTva())
            .dateDebut(entity.getDateDebut())
            .dateFin(entity.getDateFin())
            .description(entity.getDescription())
            .actif(entity.getActif())
            .build();
    }

    private Convention toEntity(ConventionDTO dto) {
        return Convention.builder()
            .code(dto.getCode())
            .libelle(dto.getLibelle())
            .tauxCommission(dto.getTauxCommission())
            .baseCalcul(dto.getBaseCalcul())
            .tauxTva(dto.getTauxTva())
            .dateDebut(dto.getDateDebut())
            .dateFin(dto.getDateFin())
            .description(dto.getDescription())
            .build();
    }

    private void updateEntityFromDTO(Convention entity, ConventionDTO dto) {
        entity.setCode(dto.getCode());
        entity.setLibelle(dto.getLibelle());
        entity.setTauxCommission(dto.getTauxCommission());
        entity.setBaseCalcul(dto.getBaseCalcul());
        entity.setTauxTva(dto.getTauxTva());
        entity.setDateDebut(dto.getDateDebut());
        entity.setDateFin(dto.getDateFin());
        entity.setDescription(dto.getDescription());
        if (dto.getActif() != null) {
            entity.setActif(dto.getActif());
        }
    }
}
