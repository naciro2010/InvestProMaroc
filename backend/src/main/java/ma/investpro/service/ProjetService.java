package ma.investpro.service;

import lombok.RequiredArgsConstructor;
import ma.investpro.dto.ProjetDTO;
import ma.investpro.entity.Projet;
import ma.investpro.exception.ResourceNotFoundException;
import ma.investpro.repository.ProjetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjetService {

    private final ProjetRepository projetRepository;

    public List<ProjetDTO> getAll() {
        return projetRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public List<ProjetDTO> getAllActive() {
        return projetRepository.findByActifTrue().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    public ProjetDTO getById(Long id) {
        Projet projet = projetRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Projet", "id", id));
        return toDTO(projet);
    }

    public List<ProjetDTO> search(String search) {
        return projetRepository.search(search).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public ProjetDTO create(ProjetDTO dto) {
        if (projetRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Un projet avec le code " + dto.getCode() + " existe déjà");
        }

        Projet projet = toEntity(dto);
        projet.setActif(true);
        Projet saved = projetRepository.save(projet);
        return toDTO(saved);
    }

    @Transactional
    public ProjetDTO update(Long id, ProjetDTO dto) {
        Projet projet = projetRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Projet", "id", id));

        if (!projet.getCode().equals(dto.getCode()) && projetRepository.existsByCode(dto.getCode())) {
            throw new IllegalArgumentException("Un projet avec le code " + dto.getCode() + " existe déjà");
        }

        updateEntityFromDTO(projet, dto);
        Projet updated = projetRepository.save(projet);
        return toDTO(updated);
    }

    @Transactional
    public void delete(Long id) {
        Projet projet = projetRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Projet", "id", id));
        projet.setActif(false);
        projetRepository.save(projet);
    }

    private ProjetDTO toDTO(Projet entity) {
        return ProjetDTO.builder()
            .id(entity.getId())
            .code(entity.getCode())
            .nom(entity.getNom())
            .description(entity.getDescription())
            .responsable(entity.getResponsable())
            .statut(entity.getStatut())
            .actif(entity.getActif())
            .build();
    }

    private Projet toEntity(ProjetDTO dto) {
        return Projet.builder()
            .code(dto.getCode())
            .nom(dto.getNom())
            .description(dto.getDescription())
            .responsable(dto.getResponsable())
            .statut(dto.getStatut())
            .build();
    }

    private void updateEntityFromDTO(Projet entity, ProjetDTO dto) {
        entity.setCode(dto.getCode());
        entity.setNom(dto.getNom());
        entity.setDescription(dto.getDescription());
        entity.setResponsable(dto.getResponsable());
        entity.setStatut(dto.getStatut());
        if (dto.getActif() != null) {
            entity.setActif(dto.getActif());
        }
    }
}
